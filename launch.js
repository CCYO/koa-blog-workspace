const { spawn } = require("child_process");
const { chalkStderr: chalk } = require("chalk"); // 用於顏色化輸出
const pty = require("@scrypted/node-pty");

const NPM = {
  BUILD: "[webpack / build]",
  FRONTEND: "[webpack / devServer]",
  BACKEND: "[nodemon / koa]",
};
const PORT = {
  DEBUG_NODEMON_KOA_SERVER: process.env.DEBUG_NODEMON_KOA_SERVER || 9223,
  DEBUG_WEBPACK_DEV_SERVER: process.env.DEBUG_WEBPACK_DEV_SERVER || 9222,
  // DEBUG_WEBPACK_BUILD_COMMON: process.env.DEBUG_WEBPACK_BUILD_COMMON,
};

let backendLock = false;

const backend = () => {
  if (backendLock) {
    return;
  }
  backendLock = true;

  go({
    command: ["run", "dev:backend"],
    prefix: NPM.BACKEND,
    // endPattern: /NODE\: v\d+\.\d+\.\d+, MODE/,
    stdio: "pipe",
    shell: true, // 兼容 Windows
    debugPort: PORT.DEBUG_NODEMON_KOA_SERVER, // Koa 伺服器偵錯埠
  });
};

const frontend = () => {
  go({
    command: ["run", "dev:frontend"],
    prefix: NPM.FRONTEND,
    // endPattern: /webpack \d+\.\d+\.\d+ compiled/,
    // callback: backend,
    // stdio: "pipe",
    stdio: "inherit",
    shell: true, // 兼容 Windows
    env: { ...process.env, FORCE_COLOR: "1" }, // 強制啟用顏色
    debugPort: PORT.DEBUG_WEBPACK_DEV_SERVER, // Webpack DevServer 偵錯埠
    usePty: true,
  });
};

frontend();
backend();
// const build = () => {
//   go({
//     command: ["run", "dev:build"],
//     prefix: NPM.BUILD,
//     endPattern: /webpack \d+\.\d+\.\d+ compiled/,
//     callback: frontend,
//     stdio: "pipe",
//     shell: true, // 兼容 Windows
//     env: { ...process.env, FORCE_COLOR: "1" }, // 強制啟用顏色
//     debugPort: PORT.DEBUG_WEBPACK_BUILD_COMMON, // Webpack Common Build 偵錯埠
//     usePty: true,
//   });
// };

// build();

// 處理stdin
function handleStdin(source, colorFn) {
  return (data) => {
    const lines = data.toString().split("\n"); // 將按行分割
    lines.forEach((line) => {
      // 去除換行符
      // if (line.trim()) {
      console.log(`${colorFn(`${source}`)} ${line}`); // 添加標記
      // }
    });
  };
}

// 處理 stderr
function handleStderr(source, data) {
  const output = data.toString();
  const isTrueError = /error|failed|exception/i.test(output); // 關鍵字檢測
  const tagColor = isTrueError ? chalk.bgRed : chalk.bgGray;
  handleStdin(
    `${source} ${isTrueError ? "=error=" : "=info="} `,
    tagColor
  )(data);
}

function go({
  command,
  prefix,
  endPattern,
  debugPort,
  callback,
  usePty = false,
  ...options
}) {
  /*
  let child;
  const env = options.env;
  // const env = {
  //   ...process.env,
  //   ...options.env,
  //   // 如果需要，將偵錯埠作為環境變數傳遞給子進程
  //   // ...(debugPort ? { NODE_OPTIONS: `--inspect=${debugPort}` } : {}),
  // };
  // 使用 node-pty 啟動子進程，用於需要 TTY 互動的應用 (如 webpackBar)
  const actualCommand = "npm";
  const actualArgs = command;
  if (debugPort) {
    // 對於 npm run scripts，需要使用 -- 來將參數傳遞給實際執行的命令
    // actualArgs.push("--");
    actualArgs.push(`-- --inspect=${debugPort}`); // 使用 --inspect 啟用偵錯，不暫停
    // 如果您希望在啟動時立即暫停並等待偵錯器連接，可以使用 --inspect-brk=${debugPort}
  }
  // ==============================================
  if (usePty) {
    child = pty.spawn(actualCommand, actualArgs, {
      name: "xterm-color",
      cols: process.stdout.columns || 80,
      rows: process.stdout.rows || 24,
      cwd: options.cwd || process.cwd(),
      env: env,
    });

    // 直接將 PTY 的輸出寫入父進程的 stdout
    // 這會讓 webpackBar 正常顯示，但不會有前綴
    child.onData((data) => {
      process.stdout.write(data);
    });

    // PTY 的 endPattern 判斷需要更複雜
    // 因為 data 可能不完整或包含 ANSI 碼
    // 您可能需要一個內部緩衝區來累積數據，然後再檢查 endPattern
    // 這裡簡化處理，可能不夠健壯
    let ptyBuffer = "";
    // 常用於互動式 UI 的 ANSI 轉義序列正則表達式
    // 這是一個簡化版本，可能無法涵蓋所有複雜情況
    const interactiveAnsiRegex = /\x1b\[(\d*(;\d*)*)?[ABCDHJKfmsu]/g;

    child.onData((data) => {
      ptyBuffer += data;

      let lastPrintedIndex = 0;
      let match;

      // 遍歷緩衝區，尋找互動式 ANSI 序列或換行符
      // 目標是將非互動的文本部分添加前綴，而將互動的 ANSI 部分直接輸出
      while ((match = interactiveAnsiRegex.exec(ptyBuffer)) !== null) {
        const interactiveStart = match.index;
        const interactiveEnd = interactiveAnsiRegex.lastIndex;

        // 處理在互動式序列之前的非互動文本
        if (interactiveStart > lastPrintedIndex) {
          const textBeforeAnsi = ptyBuffer.substring(
            lastPrintedIndex,
            interactiveStart
          );
          const lines = textBeforeAnsi.split("\n");
          for (let i = 0; i < lines.length; i++) {
            // 只有非空行或不是最後一行（即有換行符的行）才添加前綴並輸出
            if (lines[i].length > 0 || i < lines.length - 1) {
              process.stdout.write(`${prefix} ${lines[i]}\n`);
            }
          }
        }

        // 直接輸出互動式序列，不加前綴，以保留其互動效果
        process.stdout.write(
          ptyBuffer.substring(interactiveStart, interactiveEnd)
        );
        lastPrintedIndex = interactiveEnd;
      }

      // 處理緩衝區中剩餘的部分
      // 這部分可能包含常規文本，或者一個不完整的互動式序列
      const remainingBuffer = ptyBuffer.substring(lastPrintedIndex);
      if (remainingBuffer.length > 0) {
        const lines = remainingBuffer.split("\n");
        // 處理所有完整的行 (除了最後一行，因為它可能不完整)
        for (let i = 0; i < lines.length - 1; i++) {
          process.stdout.write(`${prefix} ${lines[i]}\n`);
        }
        // 將最後一行（可能不完整）保留在緩衝區中，等待更多數據
        ptyBuffer = lines[lines.length - 1];
      } else {
        ptyBuffer = ""; // 如果沒有剩餘數據，清空緩衝區
      }

      // 檢查 endPattern
      // 注意：這裡的 endPattern 檢查是對原始數據進行的，可能不夠精確
      // 因為輸出已經被拆分和處理。更健壯的方法是針對處理後的行進行檢查。
      // 但為了簡化，我們暫時對原始 data 進行檢查。
      if (endPattern && endPattern.test(data.toString())) {
        if (callback) {
          callback();
        }
        // 一旦匹配，可能需要停止監聽或做其他處理
      }
    });
  } else {
    // 使用標準的 child_process.spawn，用於普通日誌輸出和前綴
    child = spawn(actualCommand, actualArgs, {
      stdio: ["inherit", "pipe", "pipe"], // stdin 繼承，stdout/stderr 管道
      shell: options.shell,
      cwd: options.cwd,
      env: env,
    });

    // 監聽並添加前綴
    child.stdout.on("data", (data) => {
      handleStdin(prefix, chalk.bgBlue)(data);

      if (endPattern.test(data)) {
        handleStdin(prefix, chalk.bgGray)("OK");
        callback && callback();
      }
    });

    child.stderr.on("data", (data) => handleStderr(prefix, data));
  }

  // 處理子進程錯誤和退出
  child.on("error", (err) => {
    console.error(`${prefix} 啟動失敗: ${err.message}`);
  });

  child.on("exit", (code, signal) => {
    if (code !== 0) {
      console.error(`${prefix} 進程退出，代碼: ${code}, 信號: ${signal}`);
    }
  });

  return child;
  */
  // ==============================================

  let fullCommand = [...command];
  if (debugPort) {
    // 對於 npm run scripts，需要使用 -- 來將參數傳遞給實際執行的命令
    fullCommand.push("--");
    fullCommand.push(`--inspect=${debugPort}`); // 使用 --inspect 啟用偵錯，不暫停
    // 如果您希望在啟動時立即暫停並等待偵錯器連接，可以使用 --inspect-brk=${debugPort}
  }
  const process = spawn("npm", command, options);

  if (options.stdio === "pipe") {
    handleStdin(prefix, chalk.bgGray)("START");
    process.stderr.on("data", (data) => handleStderr(prefix, data));
    process.stdout.on("data", (data) => {
      handleStdin(prefix, chalk.bgBlue)(data);

      // if (endPattern.test(data)) {
      //   handleStdin(prefix, chalk.bgGray)("OK");
      //   callback && callback();
      // }
    });
  }
}

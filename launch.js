const { spawn } = require("child_process");
const { chalkStderr: chalk } = require("chalk"); // 用於顏色化輸出

// 來自 launch.json
const PORT = {
  DEBUG_SHARE: process.env.DEBUG_SHARE || 9221,
  DEBUG_FRONTEND: process.env.DEBUG_FRONTEND || 9222,
  DEBUG_BACKEND: process.env.DEBUG_BACKEND || 9223,
};
const isTEST = process.env.NODE_ENV === "test" ? true : false;

const NPM = {
  BUILD: "[Webpack / Share]",
  FRONTEND: isTEST ? "[Webpack / Frontend]" : "[Webpack / devServer]",
  BACKEND: "[Nodemon / NodeJS]",
};

let backendLock = false;

const backend = () => {
  if (backendLock) {
    return;
  }
  backendLock = true;

  go({
    command: isTEST ? ["run", "test:backend"] : ["run", "dev:backend"],
    prefix: NPM.BACKEND,
    endPattern: /NODE\: v\d+\.\d+\.\d+, MODE/,
    stdio: "pipe",
    shell: true, // 兼容 Windows
    debugPort: PORT.DEBUG_NODEMON_KOA_SERVER, // Koa 伺服器偵錯埠
  });
};

const frontend = () => {
  go({
    command: isTEST ? ["run", "test:frontend"] : ["run", "dev:frontend"],
    prefix: NPM.FRONTEND,
    endPattern: /webpack \d+\.\d+\.\d+ compiled/,
    callback: backend,
    stdio: "pipe",
    shell: true, // 兼容 Windows
    env: { ...process.env, FORCE_COLOR: "1" }, // 強制啟用顏色
    debugPort: PORT.DEBUG_WEBPACK_DEV_SERVER, // Webpack DevServer 偵錯埠
  });
};

const build = () => {
  go({
    command: isTEST ? ["run", "test:share"] : ["run", "dev:share"],
    prefix: NPM.BUILD,
    endPattern: /webpack \d+\.\d+\.\d+ compiled/,
    callback: frontend,
    stdio: "pipe",
    shell: true, // 兼容 Windows
    env: { ...process.env, FORCE_COLOR: "1" }, // 強制啟用顏色
    debugPort: PORT.DEBUG_WEBPACK_BUILD_COMMON, // Webpack Common Build 偵錯埠
  });
};

build();

// 處理stdin
function handleStdin(source, colorFn) {
  return (data) => {
    const lines = data.toString().split("\n"); // 將按行分割
    lines.forEach((line) => {
      // 去除換行符
      if (line.trim()) {
        console.log(`${colorFn(`${source}`)} ${line}`); // 添加標記
      }
    });
  };
}

// 處理 stderr
function handleStderr(source, data) {
  if (
    /Debugger attached\./.test(data) ||
    /Waiting for the debugger to disconnect\.\.\./.test(data)
  ) {
    return;
  }
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
      if (/Compiling (Webpack|Build)/.test(data)) {
        handleStdin(prefix, chalk.bgBlue)("WEBPACK 打包中.....");
      } else if (endPattern.test(data)) {
        handleStdin(prefix, chalk.bgGray)("OK");
        callback && callback();
      }
    });
  }
}

const { spawn } = require("child_process");
const { chalkStderr: chalk } = require("chalk"); // 用於顏色化輸出

const NPM = {
  BUILD: "[webpack / build:common]",
  FRONTEND: "[webpack / devServer]",
  BACKEND: "[nodemon / NodeJS]",
};
// 來自 launch.json
const PORT = {
  DEBUG_WEBPACK_BUILD_COMMON: process.env.DEBUG_WEBPACK_BUILD_COMMON || 9221,
  DEBUG_WEBPACK_DEV_SERVER: process.env.DEBUG_WEBPACK_DEV_SERVER || 9222,
  DEBUG_NODEMON_KOA_SERVER: process.env.DEBUG_NODEMON_KOA_SERVER || 9223,
};

let backendLock = false;

const backend = () => {
  if (backendLock) {
    return;
  }
  backendLock = true;

  go({
    command: ["run", "dev:node"],
    prefix: NPM.BACKEND,
    endPattern: /NODE\: v\d+\.\d+\.\d+, MODE/,
    stdio: "pipe",
    shell: true, // 兼容 Windows
    debugPort: PORT.DEBUG_NODEMON_KOA_SERVER, // Koa 伺服器偵錯埠
  });
};

const frontend = () => {
  go({
    command: ["run", "dev:devServer"],
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
    command: ["run", "dev:build:common"],
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

      if (/Compiling Webpack/.test(data)) {
        handleStdin(prefix, chalk.bgBlue)("WEBPACK 打包中.....");
      }
      if (endPattern.test(data)) {
        handleStdin(prefix, chalk.bgGray)("OK");
        callback && callback();
      }
    });
  }
}

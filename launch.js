const { spawn } = require("child_process");
const { chalkStderr: chalk } = require("chalk"); // 用於顏色化輸出

const NPM = {
  BUILD: "[webpack / build]",
  FRONTEND: "[webpack / devServer]",
  BACKEND: "[nodemon / koa]",
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
    endPattern: /NODE\: v\d+\.\d+\.\d+, MODE/,
    stdio: "pipe",
    shell: true, // 兼容 Windows
  });
};

const frontend = () => {
  go({
    command: ["run", "dev:frontend"],
    prefix: NPM.FRONTEND,
    endPattern: /webpack \d+\.\d+\.\d+ compiled/,
    callback: backend,
    stdio: "pipe",
    shell: true, // 兼容 Windows
    env: { ...process.env, FORCE_COLOR: "1" }, // 強制啟用顏色
  });
};

const build = () => {
  go({
    command: ["run", "dev:build"],
    prefix: NPM.BUILD,
    endPattern: /webpack \d+\.\d+\.\d+ compiled/,
    callback: frontend,
    stdio: "pipe",
    shell: true, // 兼容 Windows
    env: { ...process.env, FORCE_COLOR: "1" }, // 強制啟用顏色
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

function go({ command, prefix, endPattern, callback, ...options }) {
  const process = spawn("npm", command, options);

  handleStdin(prefix, chalk.bgGray)("START");
  process.stderr.on("data", (data) => handleStderr(prefix, data));
  process.stdout.on("data", (data) => {
    handleStdin(prefix, chalk.bgBlue)(data);

    if (endPattern.test(data)) {
      handleStdin(prefix, chalk.bgGray)("OK");
      callback && callback();
    }
  });
}

const { spawn } = require("child_process");
const { chalkStderr: chalk } = require("chalk"); // 用於顏色化輸出

const NPM = {
  BUILD: "[webpack / build]",
  FRONTEND: "[webpack / devServer]",
  BACKEND: "[nodemon / koa]",
};

const build = spawn("npm", ["run", "dev:build"], {
  stdio: "pipe",
  shell: true, // 兼容 Windows
  env: { ...process.env, FORCE_COLOR: "1" }, // 強制啟用顏色
});
let lock = true;
tagAndPreserveColor(NPM.BUILD, chalk.bgGray)("START");
build.stderr.on("data", (data) => handleStderr(NPM.BUILD, data));
build.stdout.on("data", (data) => {
  tagAndPreserveColor(NPM.BUILD, chalk.bgBlue)(data);
  lock = false;

  if (!lock && /webpack \d+\.\d+\.\d+ compiled/.test(data)) {
    lock = true;
    tagAndPreserveColor(NPM.BUILD, chalk.bgGray)("OK");

    // 啟動前端（改用 spawn 以更好處理 ANSI 碼）
    const frontend = spawn("npm", ["run", "dev:frontend"], {
      stdio: "pipe",
      shell: true, // 兼容 Windows
      env: { ...process.env, FORCE_COLOR: "1" }, // 強制啟用顏色
    });

    tagAndPreserveColor(NPM.FRONTEND, chalk.bgGray)("START");
    // 處理前端日誌（保留 Webpack 原始顏色）
    frontend.stderr.on("data", (data) => handleStderr(NPM.FRONTEND, data));

    // 前端啟動後啟動後端
    frontend.stdout.on("data", (data) => {
      tagAndPreserveColor(NPM.FRONTEND, chalk.bgBlue)(data);
      if (data.includes("✅")) {
        lock = false;
      }
      if (!lock && /webpack \d+\.\d+\.\d+ compiled/.test(data)) {
        lock = true;
        tagAndPreserveColor(NPM.FRONTEND, chalk.bgGray)("OK");
        tagAndPreserveColor(NPM.BACKEND, chalk.bgGray)("START");

        const backend = spawn("npm", ["run", "dev:backend"], {
          stdio: "pipe",
          shell: true,
        });

        backend.stdout.on("data", (data) => {
          tagAndPreserveColor(NPM.BACKEND, chalk.bgBlue)(data);
          if (/NODE\: v\d+\.\d+\.\d+, MODE/.test(data)) {
            tagAndPreserveColor(NPM.BACKEND, chalk.bgGray)("OK");
          }
        });

        backend.stderr.on("data", (data) => handleStderr(NPM.BACKEND, data));
      }
    });
  }
});
// 標記來源並保留原始顏色
function tagAndPreserveColor(source, colorFn) {
  return (data) => {
    const lines = data.toString().split("\n"); // 將日誌按行分割
    lines.forEach((line) => {
      if (line.trim()) {
        console.log(`${colorFn(`${source}`)} ${line}`); // 標記並轉發前端日誌
      }
    });
  };
}
function handleStderr(source, data) {
  const output = data.toString();
  const isTrueError = /error|failed|exception/i.test(output); // 關鍵字檢測
  const tagColor = isTrueError ? chalk.bgRed : chalk.bgGray;
  tagAndPreserveColor(
    `${source} =${isTrueError ? "error= " : "info= "}`,
    tagColor
  )(data);
}

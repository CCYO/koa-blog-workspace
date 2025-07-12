// debug-orchestrator.js
const { spawn } = require("child_process");
const waitOn = require("wait-on"); // 確保您已安裝 wait-on

// 從環境變數讀取埠號，與 launch.json 和 tasks.json 保持一致
const KOA_APP_PORT = process.env.KOA_APP_PORT || 3002;
const WEBPACK_DEV_SERVER_PORT = process.env.WEBPACK_DEV_SERVER_PORT || 3003;
const WEBPACK_BUILD_DEBUG_PORT = process.env.WEBPACK_BUILD_DEBUG_PORT || 9221; // 新增的 webpack build 偵錯埠

async function runBuild() {
  console.log("[Orchestrator] 正在啟動 dev:build (可偵錯)...");
  // 透過 NODE_OPTIONS 注入偵錯旗標，讓 npm run dev:build 執行時的 Node.js 進程可被偵錯
  // --inspect-brk 會讓進程在啟動時暫停，等待偵錯器連接
  const buildProcess = spawn("npm", ["run", "dev:build"], {
    stdio: "inherit", // 讓 webpackBar 正常顯示
    shell: true, // 確保跨平台兼容性
    env: {
      ...process.env,
      //   NODE_OPTIONS: `--inspect-brk=${WEBPACK_BUILD_DEBUG_PORT}`, // 注入偵錯埠
      NODE_OPTIONS: `--inspect=${WEBPACK_BUILD_DEBUG_PORT}`, // 注入偵錯埠
      FORCE_COLOR: "1", // 強制啟用顏色輸出
    },
  });

  return new Promise((resolve, reject) => {
    buildProcess.on("exit", (code) => {
      if (code === 0) {
        console.log("[Orchestrator] dev:build 已成功完成。");
        resolve();
      } else {
        console.error(`[Orchestrator] dev:build 退出，代碼: ${code}。`);
        reject(new Error(`dev:build 失敗，代碼: ${code}`));
      }
    });
    buildProcess.on("error", (err) => {
      console.error(`[Orchestrator] 無法啟動 dev:build: ${err.message}`);
      reject(err);
    });
  });
}

async function startServices() {
  console.log("[Orchestrator] 正在啟動前端和後端服務...");
  // 啟動您的 launch.js 腳本，它會負責啟動 webpack-dev-server 和 Koa 服務
  const servicesProcess = spawn("node", ["./launch.js"], {
    stdio: "inherit", // 讓 launch.js 的輸出直接顯示
    shell: true,
    env: process.env, // 傳遞所有當前的環境變數
  });

  // 讓服務進程在背景運行，不阻塞 orchestrator 腳本
  //   servicesProcess.unref();
  console.log("[Orchestrator] 服務已啟動。正在等待它們就緒...");

  // 使用 wait-on 等待服務埠可用
  await waitOn({
    resources: [
      `http://localhost:${WEBPACK_DEV_SERVER_PORT}/public`,
      `http://localhost:${KOA_APP_PORT}/public`,
    ],
    delay: 1000 * 10, // 首次檢查前等待 1 秒
    interval: 500 * 10, // 每 0.5 秒檢查一次
    timeout: 60000, // 總共等待 60 秒
    tcpTimeout: 1000, // TCP 連接超時 1 秒
    window: 1000, // 在檢查成功後再等待 1 秒，確保服務完全穩定
  });
  console.log("[Orchestrator] 所有服務都已就緒！");
}

async function main() {
  try {
    await runBuild(); // 先執行可偵錯的 build
    console.log("OKOKOKO");
    await startServices(); // 然後啟動服務並等待就緒
    console.log("[Orchestrator] 所有設定完成。您可以啟動瀏覽器偵錯會話了。");
  } catch (error) {
    console.error("[Orchestrator] 設定失敗:", error.message);
    process.exit(1); // 任何步驟失敗都退出
  }
}

main();

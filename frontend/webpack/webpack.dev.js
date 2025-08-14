/**
 * @description webpack.dev.config
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const { WEBPACK } = require("./_config");
const webpackBaseConfig = require("./webpack.config");

/* NPM        ----------------------------------------------------------------------------- */
const webpack = require("webpack");
const { merge } = require("webpack-merge");

/* EXPORT     ----------------------------------------------------------------------------- */
module.exports = merge(webpackBaseConfig, {
  cache: {
    type: "filesystem",
    buildDependencies: {
      config: [__filename],
    },
  },
  plugins: [new webpack.NoEmitOnErrorsPlugin()],
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.(png|jpg|jpeg|gif)$/,
            type: "asset",
            generator: {
              filename: `${WEBPACK.BUILD.IMAGE}/[name].[contenthash:5][ext]`,
            },
            parser: {
              dataUrlCondition: {
                maxSize: 8 * 1024,
              },
            },
          },
          {
            test: /\.css$/,
            use: ["style-loader", "css-loader"],
          },
          {
            test: /\.s[ac]ss$/,
            use: ["style-loader", "css-loader", "sass-loader"],
            use: [
              "style-loader",
              "css-loader",
              {
                loader: "sass-loader",
                options: {
                  implementation: require("sass"),
                  sassOptions: {
                    // 將根 node_modules 添加到 includePaths，確保能找到 Bootstrap
                    includePaths: [
                      require("path").resolve(__dirname, "../../node_modules"),
                    ],
                    // 新增這一行：忽略來自 node_modules 內的 Sass 警告
                    quietDeps: true,
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
  devtool: "eval-source-map",
  mode: "development",
  devServer: {
    port: WEBPACK.DEV.PORT,
    // webpack 2+ 不在需要手動添加 new webpack.HotModuleReplacementPlugin()
    hot: true,
    // 頁面重整，通常 hot:true 就不需要
    liveReload: false,
    static: {
      directory: WEBPACK.BUILD.DIST, // 替代舊版 contentBase
      publicPath: `${WEBPACK.PUBLIC_PATH}/`,
    },
    devMiddleware: {
      writeToDisk: true, // 讓 Koa 能讀取生成檔案
    },
    allowedHosts: WEBPACK.DEV.ALLOW_HOSTS,
    // 指定 HMR 客戶端連接的 WebSocket URL
    client: {
      // Webpack DevServer v4+ 的 HMR WebSocket 預設路徑通常是 '/ws'
      // 如果您的 HMR 客戶端嘗試連接的是 /__webpack_hmr，則使用該路徑
      // 建議先嘗試 /ws，如果不行再嘗試 /__webpack_hmr
      // webSocketURL: `ws://localhost:${WEBPACK.DEV.PORT}/ws`,
      webSocketURL: WEBPACK.DEV.WEB_SOCKET_URL,
      // 或者如果您的客戶端確實是連到 /__webpack_hmr
      // webSocketURL: `ws://localhost:${WEBPACK.DEV.port}/__webpack_hmr`,
      // 新增：明確指定 HMR 傳輸方式為 WebSocket，禁用其他潛在的備用方案，例如 Server-Sent Events (SSE)。
      webSocketTransport: "ws",
      // 不在畫面顯示警告與錯誤提示
      overlay: false,
    },
    // webSocketServer: "ws",
    onListening: function (devServer) {
      if (!devServer) return;
      console.log(`✅ Webpack DevServer listen PORT:${WEBPACK.DEV.PORT}`);
    },
  },
});

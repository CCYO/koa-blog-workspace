/* CONFIG     ----------------------------------------------------------------------------- */
const isProd = process.env.NODE_ENV === "production";

/* NODEJS     ----------------------------------------------------------------------------- */
const { resolve } = require("path");

/* NPM        ----------------------------------------------------------------------------- */
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const webpackBar = require("webpackbar");

/* EXPORT     ----------------------------------------------------------------------------- */
module.exports = {
  entry: resolve(__dirname, "./esm/index.js"),
  output: {
    path: resolve(__dirname, "cjs"),
    library: { type: "commonjs2" },
    filename: "index.js",
    clean: true,
  },
  experiments: { outputModule: false },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.isProd": JSON.stringify(isProd),
    }),
    new webpackBar({
      profile: true,
    }),
  ],
  optimization: _optimization(),
  devtool: isProd ? "hidden-nosources-source-map" : "eval-source-map",
  mode: isProd ? "production" : "development",
};

function _optimization() {
  if (!isProd) {
    return {};
  }
  return {
    // 默認設定
    minimize: true,
    minimizer: [
      // TerserPlugin 默認將特定的註釋，從壓縮後的程式碼中提取出來。
      // 特別是那些被視為「版權 (license) 註釋」或包含特殊關鍵字（如 @preserve, @license, /*!）的註釋。
      // 寫入一個單獨的檔案，通常命名為 [assetName].LICENSE.txt 或類似的名稱，
      new TerserPlugin({
        // 默認為true，是否單獨生成 LICENSE 檔案
        extractComments: false,
      }),
    ],
  };
}

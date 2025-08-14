/**
 * @description webpack.prod.config
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const { WEBPACK } = require("./_config");
const webpackProdConfig = require("./webpack.prod");

/* NPM        ----------------------------------------------------------------------------- */
const webpack = require("webpack");
const { merge } = require("webpack-merge");

const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const config = merge(webpackProdConfig, {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      // 報告輸出路徑
      reportFilename: `${WEBPACK.BUILD.DIST}/${WEBPACK.BUILD.HTML}/bundle-report.html`,
    }),
    new webpack.SourceMapDevToolPlugin({
      filename: "map/[name].[contenthash:5][ext].map",
      // 匹配到的文檔，不生成 map
      exclude: [/_script_inline_runtime/],
    }),
  ],
  mode: "production",
  // 由 webpack.SourceMapDevToolPlugin 負責生成 map
  // 原因：因為 Nginx 統一管理靜態資源，所以行內化腳本 _script_inline_runtime 試圖以 #sourceMappingURL 取得 map 時會發生 404，
  // prod 使用 devtool: "hidden-nosources-source-map" 可避免。
  // test 是模擬 prod 的環境，所以必須避免錯誤。
  devtool: false,
});
module.exports = config;

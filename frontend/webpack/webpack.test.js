/**
 * @description webpack.prod.config
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const { WEBPACK } = require("./_config");
const webpackProdConfig = require("./webpack.prod");

/* NPM        ----------------------------------------------------------------------------- */
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
  ],
  devtool: "source-map",
});
module.exports = config;

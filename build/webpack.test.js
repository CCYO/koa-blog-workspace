/**
 * @description webpack.prod.config
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const { WEBPACK } = require("./config");

/* NPM        ----------------------------------------------------------------------------- */
const { merge } = require("webpack-merge");

const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const production_config = require("./webpack.prod.config");

const config = merge(production_config, {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      // 報告輸出路徑
      reportFilename: `${WEBPACK.BUILD.DIST}/${WEBPACK.BUILD.HTML}/bundle-report.html`,
    }),
  ],
});
module.exports = config;

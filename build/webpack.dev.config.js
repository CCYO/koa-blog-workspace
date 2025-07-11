/**
 * @description webpack.dev.config
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const webpackBaseConfig = require("./webpack.base.config");
const { WEBPACK } = require("./config");

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
  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
  ],
  module: {
    rules: [
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
      },
    ],
  },
  devtool: "eval-source-map",
  mode: "development",
  devServer: {
    // 不在需要手動添加 new webpack.HotModuleReplacementPlugin()
    hot: true,
    liveReload: false, // 避免與 nodemon 衝突
    //
    port: WEBPACK.DEV.port,
    hot: true,
    static: {
      directory: WEBPACK.BUILD.DIST, // 替代舊版 contentBase
      publicPath: WEBPACK.PUBLIC_PATH,
    },
    devMiddleware: {
      writeToDisk: true, // 讓 Koa 能讀取生成檔案
    },
    historyApiFallback: {
      rewrites: [
        { from: /\/home/, to: "/home.html" },
        { from: /\/admin/, to: "/admin.html" },
      ],
    },
    onListening: function (devServer) {
      if (!devServer) return;
      console.log(`✅ Webpack DevServer listen PORT:${WEBPACK.DEV.port}`);
    },
  },
});

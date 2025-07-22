/**
 * @description webpack.base.config
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const { WEBPACK } = require("./config");

/* NODEJS     ----------------------------------------------------------------------------- */
const { resolve } = require("path");

/* NPM        ----------------------------------------------------------------------------- */
const webpack = require("webpack");
const WebpackBar = require("webpackbar");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");

/* CUSTOM     ----------------------------------------------------------------------------- */
const htmlWebpackPlugins = require("./utils/ins_htmlWebpackPlugins");
const entry = require("./utils/entry");
const done_hook = require("./utils/done_hook");

/* EXPORT     ----------------------------------------------------------------------------- */
module.exports = {
  target: "web", // 告訴 Webpack 目標環境能力
  context: resolve(__dirname),
  entry,
  output: {
    path: WEBPACK.BUILD.DIST,
    publicPath: `${WEBPACK.PUBLIC_PATH}/`,
    filename: WEBPACK.ENV.isProd
      ? `${WEBPACK.BUILD.SCRIPT}/[name].[contenthash:5].js`
      : `${WEBPACK.BUILD.SCRIPT}/[name].js`,
    sourceMapFilename: "map/[name].[contenthash:5].js.map",
    clean: {
      keep: /((components\/)|(wedgets\/)).+\.ejs/,
    },
    // 將 sourcemap.sources 內路徑設為絕對路徑
    // 當 sourcemap.sources 無法被正確分析時，可作為最後手段
    // devtoolModuleFilenameTemplate: "file://[absolute-resource-path]"
  },
  resolve: {
    modules: [resolve(__dirname, "../node_modules")],
    alias: {
      "@const": resolve(__dirname, "../src/const"),
      "@config": resolve(__dirname, "../src/config"),
      "@css": resolve(__dirname, "../src/css"),
    },
    extensions: [".js", ".json", ".scss"],
  },

  module: {
    noParse: /jquery/,
    rules: [
      {
        oneOf: [
          {
            test: /\.js$/,
            use: ["babel-loader"],
            exclude: /(node_modules|lib|libs)/,
          },
          {
            test: /\.(eot|woff2|woff|ttf|svg|otf)$/,
            type: "asset/resource",
            generator: {
              filename: WEBPACK.ENV.isProd
                ? `${WEBPACK.BUILD.FONT}/[name].[contenthash:5][ext]`
                : `${WEBPACK.BUILD.FONT}/[name][ext]`,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    ...htmlWebpackPlugins,
    new webpack.ProvidePlugin({
      $: "jquery",
    }),
    new webpack.DefinePlugin({
      "process.env.isProd": JSON.stringify(WEBPACK.ENV.isProd),
    }),
    new WebpackBar({
      profile: true,
    }),
    // FaviconsWebpackPlugin 會將生成的 favicon 匹配至 htmlWebpackPlugins 的 template
    // 必需留意這些template都必須有<head> HTML Tag
    new FaviconsWebpackPlugin({
      devMode: "webapp",
      cache: true,
      logo: WEBPACK.FAVICON,
      //  與自動填入html內的favicon連結有關，結果會是 webpack.base.config.output.publicPath + FaviconsWebpackPlugin.prefix + favicon檔名
      prefix: "imgs/favicon/",
      inject: true,
    }),
    new HtmlInlineScriptPlugin({
      htmlMatchPattern: [/[.]ejs$/],
      scriptMatchPattern: [/runtime\.js$/, /runtime[.]\w+[.]js$/],
      // 保留匹配的資源，不刪除原始文件
      assetPreservePattern: [/runtime[.]\w+[.]js$/],
    }),
    //  生成NGINX靜態錯誤頁面
    done_hook,
  ],
  optimization: {
    //  紀錄所有chunk彼此的引用關係
    runtimeChunk: {
      name: "runtime",
    },
  },
};

/**
 * @description webpack.base.config
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const { WEBPACK } = require("./config");

/* NODEJS     ----------------------------------------------------------------------------- */
const { resolve } = require("path");

/* NPM        ----------------------------------------------------------------------------- */
const webpack = require("webpack");

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
      ? `${WEBPACK.BUILD.SCRIPT}/[name].js`
      : `${WEBPACK.BUILD.SCRIPT}/[name].[contenthash:5].js`,
    sourceMapFilename: "map/[name].[contenthash:5].js.map",
    clean: {
      keep: /((components\/)|(wedgets\/)).+\.ejs/,
    },
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
      // {
      //   test: /\.ejs$/,
      //   use: ["raw-loader"],
      // },
      //   loader: "lodash-template-loader",
      //   options: {
      //     evaluate: /<\$([\s\S]+?)\$>/g, // 自定義 evaluate 標籤為 {{}}
      //     interpolate: /<\$=([\s\S]+?)\$>/g, // 自定義 interpolate 標籤為 {{=}}
      //     escape: /<\$-([\s\S]+?)\$>/g, // 自定義 escape 標籤為 {{-}}
      //   },
      // },
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
    //  生成NGINX靜態錯誤頁面
    done_hook,
  ],
};

// /* CONFIG     ----------------------------------------------------------------------------- */
// const { WEBPACK } = require("./config");

// /* NODEJS     ----------------------------------------------------------------------------- */
// const { resolve } = require("path");

// /* NPM        ----------------------------------------------------------------------------- */
// const webpack = require("webpack");
// const FaviconsWebpackPlugin = require("favicons-webpack-plugin");
// const WebpackBar = require("webpackbar");

// /* CUSTOM     ----------------------------------------------------------------------------- */
// const htmlWebpackPlugins = require("./utils/ins_htmlWebpackPlugins");
// const entry = require("./utils/entry");
// const done_hook = require("./utils/done_hook");

// /* EXPORT     ----------------------------------------------------------------------------- */
// module.exports = {
//   target: "web", // 告訴 Webpack 目標環境能力
//   context: resolve(__dirname),
//   entry,
//   output: {
//     path: WEBPACK.BUILD.DIST,
//     publicPath: `${WEBPACK.PUBLIC_PATH}/`,
//     filename: !WEBPACK.ENV.isProd
//       ? `${WEBPACK.BUILD.SCRIPT}/[name].js`
//       : (pathData) => {
//           // report.js 取至 src/assets/js/report.js，用來處理「資源加載失敗時，回報伺服器」的功能，
//           //           // 並以<script src="/public/js/report.js">，
//           //           // 直接寫入 src/views/wedgets/header/components/script_tag.ejs讀取，
//           //           // 因此需要一個固定的檔名
//           return pathData.chunk.name === "report"
//             ? `${WEBPACK.BUILD.SCRIPT}/[name].js`
//             : `${WEBPACK.BUILD.SCRIPT}/[name].[contenthash:5].js`;
//         },

//     // 指定map存放位置，且sourceMappingURL 指向 /public/map/[name].[contenthash:5].js.map
//     sourceMapFilename: "map/[name].[contenthash:5].js.map",
//     // clean.keep 可以是regex，匹配的是「相對output.path的路徑」
//     clean: {
//       keep: /((components\/)|(wedgets\/)).+\.ejs/,
//     },
//     // devtoolModuleFilenameTemplate: "file://[absolute-resource-path]", // 設定為絕對路徑
//   },
//   resolve: {
//     modules: [resolve(__dirname, "../node_modules")],
//     alias: {
//       "@const": resolve(__dirname, "../src/const"),
//       "@config": resolve(__dirname, "../src/config"),
//       "@css": resolve(__dirname, "../src/css"),
//     },
//     extensions: [".js", ".json", ".scss"],
//   },

//   module: {
//     noParse: /jquery/,
//     rules: [
//       {
//         test: /\.js$/,
//         // thread-loader 效果不佳
//         // webpack.dev.config 已開啟 cache.type: "filesystem"，可取代babel cache
//         use: ["babel-loader"],
//         exclude: /(node_modules|lib|libs)/,
//       },
//       {
//         test: /\.(eot|woff2|woff|ttf|svg|otf)$/,
//         type: "asset/resource",
//         generator: {
//           filename: WEBPACK.ENV.isProd
//             ? `${WEBPACK.BUILD.FONT}/[name].[contenthash:5][ext]`
//             : `${WEBPACK.BUILD.FONT}/[name][ext]`,
//         },
//       },
//       {
//         test: /\.ejs$/,
//         use: ["raw-loader"],
//       },
//     ],
//   },
//   plugins: [
//     ...htmlWebpackPlugins,
//     new webpack.ProvidePlugin({
//       $: "jquery",
//     }),
//     new webpack.DefinePlugin({
//       "process.env.isProd": JSON.stringify(WEBPACK.ENV.isProd),
//     }),
//     //  生成NGINX靜態錯誤頁面
//     done_hook,
//     // FaviconsWebpackPlugin 會將生成的 favicon 匹配至 htmlWebpackPlugins 的 template
//     // 必需留意這些template都必須有<head> HTML Tag
//     // @@@
//     // new FaviconsWebpackPlugin({
//     //   devMode: "webapp",
//     //   cache: true,
//     //   logo: resolve(__dirname, "../src/assets/imgs/favicon.png"),
//     //   //  與自動填入html內的favicon連結有關，結果會是 webpack.base.config.output.publicPath + FaviconsWebpackPlugin.prefix + favicon檔名
//     //   prefix: "imgs/favicon/",
//     //   inject: true,
//     // }),
//     // @@@
//     // new WebpackBar({
//     //   profile: true,
//     // }),
//   ],
// };

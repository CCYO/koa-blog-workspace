/**
 * @description webpack.prod.config
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const { WEBPACK } = require("./_config");
const webpackBaseConfig = require("./webpack.config");

/* NPM        ----------------------------------------------------------------------------- */
const { merge } = require("webpack-merge");
const OptimizeCss = require("css-minimizer-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const TerserPlugin = require("terser-webpack-plugin");
const CompressionWebpackPlugin = require("compression-webpack-plugin");

const prod_config = {
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
            use: _styleLoaderList(),
          },
          {
            test: /\.s[ac]ss$/,
            use: [..._styleLoaderList(), "sass-loader"],
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `${WEBPACK.BUILD.STYLE}/[name].[contenthash:5].min.css`,
    }),
    new OptimizeCss(),
    new CompressionWebpackPlugin({
      test: /\.(js|css)$/,
      threshold: 1024, // 超過 1kb
      deleteOriginalAssets: false, // 不刪除原檔
      minRatio: 0.8, //  壓縮率優於此值，才作壓縮
    }),
  ],
  optimization: {
    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          priority: 10,
          chunks: "async",
          test: /[\\/]node_modules[\\/]/,
          minChunks: 1,
          minSize: 0,
          reuseExistingChunk: true,
          name(module, chunks, cacheGroupKey) {
            return chunks.reduce((acc, chunk) => (acc += `@${chunk.name}`), "");
          },
          filename: `${WEBPACK.BUILD.SCRIPT}/dynamic_vendor.[name].[contenthash:5].js`,
        },
        vendors_npm: {
          priority: 0,
          chunks: "all",
          test: /[\\/]node_modules[\\/]/,
          minChunks: 1,
          name: "vendors_npm",
        },
        default: {
          priority: -10,
          chunks: "async",
          minChunks: 2,
          reuseExistingChunk: true,
          filename: `${WEBPACK.BUILD.SCRIPT}/dynamic_common.[name].[contenthash:5].js`,
          name(module, chunks, cacheGroupKey) {
            return chunks.reduce((acc, chunk) => (acc += `@${chunk.name}`), "");
          },
        },
        common: {
          priority: -20,
          chunks: "initial",
          minChunks: 2,
          minSize: 0,
          name: "common",
        },
      },
    },
    minimize: true,
    minimizer: [
      new TerserPlugin({
        minify: TerserPlugin.esbuildMinify,
        terserOptions: {},
      }),
    ],
  },
  devtool: "hidden-nosources-source-map",
  mode: "production",
};

module.exports = merge(webpackBaseConfig, prod_config);

function _styleLoaderList() {
  return [
    {
      loader: MiniCssExtractPlugin.loader,
    },
    {
      loader: "css-loader",
      options: {
        importLoaders: 2,
      },
    },
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: ["postcss-preset-env"],
        },
      },
    },
  ];
}

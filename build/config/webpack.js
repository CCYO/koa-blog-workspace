/**
 * @description webpack文件打包的相關配置
 */

/* NODEJS     ----------------------------------------------------------------------------- */
const { resolve } = require("path");
const { WEBPACK } = require("../_config");

const isProd = process.env.NODE_ENV === "production";
const LAYER = isProd ? "server" : "dist";
/* EXPORT     ----------------------------------------------------------------------------- */
module.exports = {
  ENV: {
    isProd,
  },
  PUBLIC_PATH: "/public",
  //  存放的資料夾名稱
  BUILD: {
    LAYER,
    DIST: isProd
      ? resolve(__dirname, `../../${LAYER}/assets`)
      : resolve(__dirname, `../../${LAYER}`),
    VIEW: isProd
      ? resolve(__dirname, `../../${LAYER}/views`)
      : resolve(__dirname, `../../${LAYER}/views`),
    STYLE: "css",
    SCRIPT: "js",
    FONT: "fonts",
    IMAGE: "imgs",
  },
  DEV: {
    PORT: WEBPACK.DEV_PORT,
    ALLOW_HOSTS: WEBPACK.ALLOW_HOSTS,
    WEB_SOCKET_URL: WEBPACK.WEB_SOCKET_URL,
  },
};

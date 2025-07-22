/**
 * @description 環境變量
 */

const MODE = process.env.NODE_ENV;
const isNoCache = process.env._CACHE === "false";
const isTest = process.env._TEST === "true";

module.exports = {
  MODE,
  isNoCache,
  isTest,
  isDev: MODE === "development",
  isProd: MODE === "production",
};

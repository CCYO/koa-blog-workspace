/**
 * @description 環境變量
 */

const MODE = process.env.NODE_ENV;
const isNoCache = process.env._CACHE === "false";

module.exports = {
  MODE,
  isNoCache,
  isTest: MODE === "test",
  isDev: MODE === "development",
  isProd: MODE === "production",
};

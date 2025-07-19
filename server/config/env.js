/**
 * @description 環境變量
 */

const MODE = process.env.NODE_ENV;
const ENV = process.env._MODE;

module.exports = {
  MODE,
  isNoCache: MODE === "nocache",
  isDev: MODE === "development",
  isProd: MODE === "production",
  isTest: ENV === "test",
};

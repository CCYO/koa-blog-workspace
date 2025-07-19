const ENV = require("./env");
console.log("ENV.isTest", ENV.isTest, "ENV.MODE", ENV.MODE);
// const target = `../../common/dist/${
//   ENV.isProd ? "common.cjs.js" : "dev_common.cjs.js"
// }`;
// console.log(target);
const { CONST: COMMON } = ENV.isProd
  ? require("../../common/dist/common.cjs.js")
  : require("../../common/dist/dev_common.cjs.js");
// const { CONST: COMMON } = require(target);
module.exports = COMMON;

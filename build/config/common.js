/**
 * @description 前後端共用的常數
 */

// 只取常數的部分
const { CONST: COMMON } =
  process.env.NODE_ENV === "production"
    ? require("../../common/dist/common.cjs.js")
    : require("../../common/dist/dev_common.cjs.js");
module.exports = COMMON;

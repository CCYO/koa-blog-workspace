/* CONFIG      ----------------------------------------------------------------------------- */
const { _Ajv } = require("../../../share/cjs/index.js");

const schemaFn_list = require("./schema/index.js");
const type = require("./type.js");
const _ajv = new _Ajv({
  schemaFn_list,
  type,
});

module.exports = _ajv;

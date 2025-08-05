/**
 * @description 彙整api ws
 */

/* NPM        ----------------------------------------------------------------------------- */
const Router = require("@koa/router");

/* MIDDLEWARE ----------------------------------------------------------------------------- */
const WS = require("../../middleware/ws");

const router = new Router({ prefix: "/ccyo_ws" });

/**
 * @description 開啟ws連線
 */
router.get("/", WS.close_same_id, WS.init);

module.exports = router;

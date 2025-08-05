/**
 * @description reportErrot api
 */

/* NPM        ----------------------------------------------------------------------------- */
const Router = require("@koa/router");

/* MIDDLEWARE ----------------------------------------------------------------------------- */
const { REPORT } = require("../../middleware/api");

const router = new Router({ prefix: "/report" });

router.post("/srcErr", REPORT.loadErr);
router.post("/error", REPORT.codeErr);

module.exports = router;

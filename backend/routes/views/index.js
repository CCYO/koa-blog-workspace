/**
 * @description 彙整api routes
 */
/* NPM        ----------------------------------------------------------------------------- */
const Router = require("@koa/router");

let album = require("./album");
let blog = require("./blog");
let errPage = require("./errPage");
let square = require("./square");
let user = require("./user");
let line = require("./line");

const router = new Router();

router.use(album.routes());
router.use(blog.routes());
router.use(errPage.routes());
router.use(square.routes());
router.use(user.routes());
router.use(line.routes());

module.exports = router;

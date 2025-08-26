/**
 * @description 彙整api routes
 */
const Router = require("@koa/router");

let album = require("./album");
let square = require("./square");
let blog = require("./blog");
let comment = require("./comment");
let news = require("./news");
let user = require("./user");
let line = require("./line");
let dialogflow = require("./dialogflow");
let report = require("./report");

const router = new Router({ prefix: "/api" });

router.use(report.routes());
router.use(album.routes());
router.use(square.routes());
router.use(blog.routes());
router.use(comment.routes());
router.use(news.routes());
router.use(user.routes());
router.use(line.routes());
router.use(dialogflow.routes());

module.exports = router;

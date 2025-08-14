/**
 * @description 彙整routes
 */

/* Config     ----------------------------------------------------------------------------- */
const { ENV, ERR_RES } = require("../config");

/* NPM        ----------------------------------------------------------------------------- */
let Router = require("@koa/router");

/* UTILS      ----------------------------------------------------------------------------- */
const { MyErr, ErrModel } = require("../utils/model");

const api = require("./api");
const views = require("./views");
const ws = require("./ws");

const router = new Router();

router.use(api.routes());
router.use(views.routes());
router.use(ws.routes());

/**
 * @description index -> square
 */
router.get("/", async (ctx) => {
  ctx.redirect("/square");
});

/**
 * @description test error
 */
if (!ENV.isProd) {
  // 會自動處理 HEAD 請求
  router.get("/wait-on", async (ctx) => {
    ctx.status = 200;
    // 如果是 GET 請求會發送，HEAD 請求會忽略
    ctx.body = "OK";
  });
  router.get("/report", async (ctx, next) => {
    if (ENV.isDev) {
      ctx.body = ENV;
    } else {
      ctx.redirect("/public/html/bundle-report.html");
    }
  });
  router.get("/api/error", async () => {
    throw new MyErr(ERR_RES.SERVER.RESPONSE.TEST);
  });
  router.get("/api/needLogin", async (ctx) => {
    ctx.body = new ErrModel(ERR_RES.SERVER.RESPONSE.NO_LOGIN);
  });
  router.get("/api/newsNoLogin", async (ctx) => {
    ctx.body = new ErrModel(ERR_RES.NEWS.READ.NO_LOGIN);
  });
  router.get("/view/error", async () => {
    throw new MyErr(ERR_RES.SERVER.RESPONSE.TEST);
  });
}

module.exports = router;

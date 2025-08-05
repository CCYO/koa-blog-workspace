/**
 * @description square api
 */

/* NPM        ----------------------------------------------------------------------------- */
const Router = require("@koa/router");

/* CONTROLLER ----------------------------------------------------------------------------- */
const Square = require("../../controller/square");

const router = new Router({ prefix: "/square" });

/**
 * @description find pagination of square list
 */
router.post("/list", async (ctx) => {
  ctx.body = await Square.findListForPagination({
    user_id: ctx.session.user?.id,
    ...ctx.request.body,
  });
});

module.exports = router;

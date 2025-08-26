/**
 * @description square view
 */

/* CONFIG    ----------------------------------------------------------------------------- */
const {
  CONSTANT: { PAGE },
} = require("../../config");

/* NPM        ----------------------------------------------------------------------------- */
const Router = require("@koa/router");

const router = new Router({ prefix: "/line" });

/**
 * @description line
 */
router.get("/login", async (ctx) => {
  await ctx.render("line", {
    active: PAGE.SQUARE.ACTIVE._,
    page: PAGE.SQUARE.PAGE_NAME,
    login: Boolean(ctx.session.user),
    title: "LINE小幫手",
  });
});

module.exports = router;

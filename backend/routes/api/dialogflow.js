/**
 * @description line api
 */

/* NPM        ----------------------------------------------------------------------------- */
const Router = require("@koa/router");

const router = new Router({ prefix: "/dialogflow" });

router.post("/articleCount", async (ctx) => {
  console.log("@", ctx.request);
  const responseData = {
    // fulfillmentResponse: {
    messages: [
      {
        text: {
          text: ["Webhook 呼叫成功！"],
        },
      },
    ],
    // },
  };
  ctx.body = responseData;
});

module.exports = router;

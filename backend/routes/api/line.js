/**
 * @description line api
 */

const crypto = require("crypto");

/* NPM        ----------------------------------------------------------------------------- */
const Router = require("@koa/router");

const router = new Router({ prefix: "/line" });

router.post("/webhook", async (ctx) => {
  ctx.body = "測試ok";
});

module.exports = router;

const {
  LINE: { login_api },
} = require("../../_config");

const {
  lineChannelId,
  client_secret,
  redirectUri,
  scope,
  friendshipStatusChanged,
  authorizationAPI,
} = login_api;

router.get("/authorization", async (ctx) => {
  // 生成一個隨機的 state 字串
  const state =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  // 將生成的 state 儲存到當前使用者的 Session 中
  ctx.session.lineLoginState = state;
  console.log("Generated and stored state:", state);

  // 構建 Line 授權 URL
  const authorizationUrl =
    `${authorizationAPI}?` +
    new URLSearchParams({
      response_type: "code",
      client_id: lineChannelId,
      redirect_uri: redirectUri,
      state,
      scope,
      friendship_status_changed: friendshipStatusChanged,
    }).toString();

  // 重定向使用者到 Line 授權頁
  ctx.redirect(authorizationUrl);
  // 讓客戶允諾 LINE 提供 access token (訪問令牌)
});

// 處理 Line 回傳的 Callback 請求
router.get("/callback", async (ctx) => {
  const { code, state, error, error_description } = ctx.query;

  // 1. 檢查是否有錯誤碼
  if (error) {
    ctx.body = `Line 登入失敗: ${error_description || error}`;
    console.error("Line Login Error:", error, error_description);
    return;
  }

  // 2. 驗證 state 參數以防 CSRF 攻擊
  const storedState = ctx.session.lineLoginState;
  console.log("Received state:", state);
  console.log("Stored state:", storedState);

  if (!state || !storedState || state !== storedState) {
    ctx.status = 403;
    ctx.body = "安全錯誤：無效的 State 參數，可能是 CSRF 攻擊。";
    console.error("CSRF Attack Detected: State mismatch.");
    return;
  }

  // 3. 清除 Session 中儲存的 state (一次性使用)
  delete ctx.session.lineLoginState;

  const axios = require("axios"); // 需要安裝 axios

  let accessToken;
  let idToken;
  let lineUserId;
  try {
    const payload = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      // 必須與引導使用者到 Line 授權頁所傳的 redirect_uri 參數相同
      redirect_uri: redirectUri,
      client_id: lineChannelId,
      client_secret,
    }).toString();
    // [取得 access token](https://developers.line.biz/en/reference/line-login/#issue-access-token)
    const tokenResponse = await axios.post(
      "https://api.line.me/oauth2/v2.1/token",
      payload,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // [驗證 token ]( https://developers.line.biz/en/reference/line-login/#verify-access-token )
    accessToken = tokenResponse.data.access_token;
    idToken = tokenResponse.data.id_token;

    // 解析 ID Token 取得使用者資訊 (例如 Line User ID)
    // ID Token 是一個 JWT，需要解析
    const jwt = require("jsonwebtoken"); // 需要安裝 jsonwebtoken
    // 解析JWT，從中取得使用者基本資訊(https://developers.line.biz/en/docs/line-login/verify-id-token/#payload)
    const decodedIdToken = jwt.decode(idToken);

    lineUserId = decodedIdToken.sub; // 使用者的 Line User ID

    // 儲存使用者資訊到資料庫
    // await yourDatabase.saveUser({ lineUserId, accessToken, ... });

    // ctx.body = "登入成功，使用者資訊已處理！";
  } catch (tokenError) {
    console.error(
      "Failed to get access token:",
      tokenError.response ? tokenError.response.data : tokenError.message
    );
    ctx.status = 500;
    ctx.body = "交換 Access Token 失敗。";
  }

  try {
    //  [好友狀態](https://developers.line.biz/en/docs/line-login/link-a-bot/)
    const friendshipResponse = await axios.get(
      "https://api.line.me/friendship/v1/status",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!friendshipResponse.data.friendFlag) {
      console.log("不是朋友");
      // 發出朋友邀請
    }
  } catch (error) {
    // 檢查 error 物件中是否包含 LINE API 的錯誤響應( https://developers.line.biz/en/reference/messaging-api/#send-push-message-error-response )
    if (error.response && error.response.data && error.response.data.message) {
      const errorMessage = error.response.data.message;
      console.error("LINE API 錯誤：", errorMessage);
      // 錯誤處理: 記錄日誌、發送錯誤通知等
    } else {
      // 非 LINE API 響應的錯誤，如:例如網路連線問題
      console.error("發生未知錯誤：", error.message);
    }
    ctx.status = 500;
    return;
  }

  try {
    //
    const {
      LINE: { message_api },
    } = require("../../_config");

    // 發出訊息
    await axios.post(
      "https://api.line.me/v2/bot/message/push",
      {
        to: lineUserId,
        messages: [
          // 最多五則訊息
          {
            type: "text",
            text: "該起來動一動囉",
          },
          {
            type: "text",
            text: "順便喝水也不錯唷",
          },
        ],
        // 禁用推播
        // notificationDisabled: false,
        // 設置標籤，作為數據分析依據
        // customAggregationUnits
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${message_api.accell_token}`,
          "X-Line-Retry-Key": crypto.randomUUID(),
        },
      }
    );

    ctx.body = "【LINE官方帳號/久坐小幫手】已經開始提醒你要起來動一動囉！";
  } catch (error) {
    // 檢查 error 物件中是否包含 LINE API 的錯誤響應( https://developers.line.biz/en/reference/messaging-api/#send-push-message-error-response )
    if (error.response && error.response.data && error.response.data.message) {
      const errorMessage = error.response.data.message;
      console.error("LINE API 錯誤：", errorMessage);
      // 錯誤處理: 記錄日誌、發送錯誤通知等
    } else {
      // 非 LINE API 響應的錯誤，如:例如網路連線問題
      console.error("發生未知錯誤：", error.message);
    }
  }
});

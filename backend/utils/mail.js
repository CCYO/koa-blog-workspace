const nodemailer = require("nodemailer");
const { GMAIL } = require("../_config");

module.exports = async function (email, code) {
  // nodemailer 文檔：https://nodemailer.com/usage/using-gmail/
  // google 文檔：https://support.google.com/mail/answer/185833?hl=en
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL.USER,
      pass: GMAIL.PASS,
    },
  });
  const mailOptions = {
    from: GMAIL.USER,
    to: email,
    subject: "【KOA BLOG】註冊驗證碼",
    html: `<p>註冊驗證碼如下: </p><p>${code}</p>`,
  };

  await transporter.verify();
  await transporter.sendMail(mailOptions);
};

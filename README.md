common/
"cross-env": "^7.0.3",

    "ajv": "^8.17.1",
    "ajv-errors": "^3.0.0",
    "ajv-formats": "^2.1.1",
    "ajv-keywords": "^5.1.0",
    "lodash": "^4.17.21",

server/
// 運行
"dotenv": "^16.3.1",
"pm2": "^5.4.2",
"nodemon": "^1.19.1",

    // koa
    "koa": "^2.7.0",
    "@ladjs/koa-views": "^9.0.0",
    "ejs": "^3.1.10",
    "koa-bodyparser": "^4.2.1",
    "koa-generic-session": "^2.3.0",
    "koa-easy-ws": "^2.1.0",

    // 可讀性
    "koa-json": "^2.0.2",

    // utils
    "nodemailer": "^6.9.16",

    // 資料庫
    "formidable": "^3.5.1",
    "redis": "^4.0.2",
    "mysql2": "^2.3.3",
    "sequelize": "^6.14.0",
    "cls-hooked": "^4.2.2",
    "@google-cloud/storage": "^5.18.2",
    "firebase-admin": "^10.0.2",

    // 除錯
    "source-map": "^0.7.4",

留? "dayjs": "^1.11.11",
"koa-convert": "^1.2.0",
"koa-onerror": "^4.1.0",
"firebase": "^9.6.7",

build/

./

"dependencies": {
"cross-env": "^7.0.3",

    "core-js": "3.35",
    "@babel/runtime": "^7.22.6",
    "@babel/runtime-corejs3": "^7.22.6",


    "axios": "^0.26.1",
    "better-scroll": "^2.5.1",
    "bootstrap": "^5.3.3",

    "dayjs": "^1.11.11",
    "@wangeditor-next/editor": "^5.6.19",

    "jquery": "^3.7.0",
    "glob": "^11.0.1",
    "image-webpack-loader": "^8.1.0",

    "spark-md5": "^3.0.2",
    "tracekit": "^0.4.7",

},

"devDependencies": {
"webpack": "^5.88.1",
"webpack-cli": "^4.10.0",
"webpack-merge": "^5.9.0",
"webpackbar": "^6.0.1"

    "@babel/plugin-transform-runtime": "^7.22.9",
    "@babel/preset-env": "^7.22.9",
    "babel-loader": "^9.1.3",

    "html-webpack-plugin": "^5.5.0",

    "css-loader": "^6.8.1",
    "css-minimizer-webpack-plugin": "^5.0.1",
    "less-loader": "^11.1.3",
    "mini-css-extract-plugin": "^2.7.6",
    "postcss-loader": "^7.3.3",
    "postcss-preset-env": "^9.0.0",
    "sass": "^1.64.2",
    "sass-loader": "^13.3.3",
    "style-loader": "^3.3.3",

    "favicons-webpack-plugin": "^6.0.1",
    "html-inline-script-webpack-plugin": "^3.2.1",

    // 打包優化
    "terser-webpack-plugin": "^5.3.10",

    // 壓縮
    "compression-webpack-plugin": "^11.1.0",

    // 分析
    "webpack-bundle-analyzer": "^4.10.2",

? "esbuild": "^0.23.0",
? "browserslist": "^4.24.4",
? "caniuse-lite": "^1.0.30001699",

    "favicons": "^7.2.0",
    "webpack-dev-middleware": "^6.1.1",
    "raw-loader": "^4.0.2",
    "filemanager-webpack-plugin": "^8.0.0",
    "koa-webpack-hot-middleware": "^1.0.3",

}

[開發環境 + NGINX] OK
dev.nginx 備份在第一層
確認 macOS 是否默認使用 5000
sudo lsof -i :5000

3000 NodeJS dev
8080 webpack devServer

8000
8081
9000

1024 以上(不含) NodeJS prod

您好，我是一位前端網頁設計的自學者，這個 project 是以模擬『部落格網站』為方向，希望呈現我具有網站前端的基本能力。

關於架站配置、網站功能與實現方式，請前往網站內的[文章頁](https://ccyo.work/blog/1)了解。

Source Map Debugging 的核心概念

IDE
VScode
Source Map Debugging
取代在瀏覽器的開發者模式下斷點
可直接在「代碼開發工具（如 VS Code）」的原始碼下斷點
前端運行中、已被打包的程式碼，會在原始碼下斷點的相應位置停止

結合 Edge 除錯擴充功能的 VS Code 的 launch.json 配置

launch.json 的 Edge 除錯擴充功能配置

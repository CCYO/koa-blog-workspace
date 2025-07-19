/**
 * @description  取得webpack.base.config內，plugins中的htmlWebpackPlugins
 */

/* CONFIG     ----------------------------------------------------------------------------- */
const { WEBPACK } = require("../config");

/* NODEJS     ----------------------------------------------------------------------------- */
const fs = require("fs");
const { resolve } = require("path");

/* NPM        ----------------------------------------------------------------------------- */
// webpack
const glob = require("glob");
const HtmlWebpackPlugin = require("html-webpack-plugin");

/* VAR        ----------------------------------------------------------------------------- */
let dist = "";
/* EXPORT     ----------------------------------------------------------------------------- */
module.exports = (function () {
  const result = [];
  let template_dir = resolve(__dirname, "../../src/views/**/*.ejs");
  let dirList = glob.sync(template_dir);
  dirList.forEach((filepath) => {
    /**
     * ~/.../views/pages/[TypeName]/index.ejs
     * ~/.../views/pages/[TypeName]/component/*.ejs     --> 提供index.ejs使用
     * ~/.../views/pages/[TypeName]/template/*.ejs      --> 提供src/js/utils/render與server/js/utils/render使用
     * ~/.../views/wedgets/[wedgetType]/index.ejs
     * ~/.../views/wedgets/[wedgetType]/component/*.ejs
     * ~/.../views/wedgets/[wedgetType]/template/*.ejs  --> 提供src/js/utils/render使用
     */
    let array_filepath = filepath.split(/[\/|\/\/|\\|\\\\]/g); // eslint-disable-line
    array_filepath.shift();
    const filename = array_filepath.pop(); //  移除、取得原檔名
    const isPage = !!array_filepath.find((item) => item === "pages");
    const isTemplate = !!array_filepath.find((item) => item === "template");
    const isComponent = !!array_filepath.find((item) => item === "components");
    const isPageIndex = isPage && !isTemplate && !isComponent;
    let index_views = array_filepath.findIndex((item) => item === "views");

    // <page>/template/*.ejs 類型，由 common 負責打包成 render 函數來使用
    if (isTemplate) {
      return;
    }
    array_filepath[index_views - 1] = WEBPACK.BUILD.LAYER;

    //  創建 server/[dev_]views 內，除了 isPageIndex 以外的 ejs
    for (let [index, folder] of array_filepath.entries()) {
      if (
        // 不用生成 pages 資料夾
        folder === "pages" ||
        // 過濾掉 [page]/index.ejs(由 HtmlWebpackPlugin 生成)
        isPageIndex
      ) {
        continue;
      }
      //  ejs檔要存放的folder
      target_folder = !index ? `/${folder}` : `${target_folder}/${folder}`;
      // if (index >= index_views && !fs.existsSync(target_folder)) {
      if (index >= index_views - 1 && !fs.existsSync(target_folder)) {
        //  創建index_views內相符的folder
        fs.mkdirSync(target_folder);
      }
      // 創建ejs檔
      if (index + 1 === array_filepath.length) {
        let ejs_string = fs.readFileSync(filepath, "utf-8");
        fs.writeFileSync(`${target_folder}/${filename}`, ejs_string);
      }
    }
    // 非 [page]/index.ejs 到這就處理結束了
    if (!isPageIndex) {
      return;
    }
    //  生成 HtmlWebpackPlugin
    //  匹配到 webpackConfig.entry {[chunkName]: 檔案位置}
    const pageName = array_filepath[index_views + 2];
    let opts = {
      filename: `${WEBPACK.BUILD.VIEW}/${pageName}/${filename}`,
      // template: new_filepath,
      template: filepath,
      //   以entry[chunkName]匹配那些打包後js要被插入
      chunks: [pageName],
      //   指定打包完成的js，插入body尾部
      inject: "body",
    };
    result.push(new HtmlWebpackPlugin(opts));
  });
  return result;
})();

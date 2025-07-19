[開發環境 + NGINX] OK
	dev.nginx 備份在第一層 
確認 macOS 是否默認使用 5000
sudo lsof -i :5000

3000	NodeJS	dev	
8080	webpack devServer	

8000
8081
9000

1024以上(不含)	NodeJS 	prod

					
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

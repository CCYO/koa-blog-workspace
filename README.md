webpack 的 template string
https://webpack.docschina.org/configuration/output/#template-strings

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

# /etc/nginx/conf.d/koa-blog-log-format.conf

log_format _koa-blog
    '[$time_local] $status | $request_time $upstream_response_time | '
    '$remote_addr -> $request($body_bytes_sent) '
    '"$http_referer" "$http_user_agent" "$http_x_forwarded_for"';
...

# /etc/nginx/conf.d/koa-blog-map.conf

map $http_accept $expected_format {
"~\*text/html" "html";
default "not_html";
}

map $host $host_env {
koa-blog.ccyo.work "production";
default "not_production";
}

map $arg_env $env_is_test {
"test" "true";
default "false";
}

map "$host_env-$env_is_test" $current_env {
"production-false" "prod";
"not_production-false" "dev";
default "test";
}

map $current_env $static_root {
"dev" "/home/ccy015ccy/koa-blog/frontend/dist";
default "/home/ccy015ccy/koa-blog/backend/assets";
}

map $current_env $node_host_port {
"prod" "localhost:8081";
default "localhost:3000";;
}

map $expected_format $error_response {
"html" @error_page
default @error_json
}

map $status $error_status_json {
    400     '{"error": 400, "message": "Bad Request"}'
    404     '{"error": 404, "message": "Not Found"}'
    # ....補齊所有需要的 $status 情況....略....
    500     '{"error": 500, "message": "Internal Server Error"}'
    # 通用回應
    default '{"error": '$status', "message": "An unexpected error occurred."}'
}
---

# /etc/nginx/snippets/koa-blog-log.nginx

# 定義 log 存放路徑

# _koa-blog 來自 /etc/nginx/conf.d/koa-blog-log-format.conf
# $current_env 來自 /etc/nginx/conf.d/koa-blog-map.conf
access_log  /var/log/nginx/$current_env/access.log _main;
error_log	/var/log/nginx/$current_env/error.log;

---

# /etc/nginx/snippets/koa-blog-ssl.nginx

include /etc/letsencrypt/options-ssl-nginx.conf;
ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
ssl_certificate /etc/letsencrypt/live/\_ccyo.work/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/\_ccyo.work/privkey.pem;

---
# /etc/nginx/snippets/koa-blog-ws.nginx

# 維持長連線
        proxy_http_version	1.1;

        # 無此配置的情況，請求頭 Host 則為 proxy_pass 值
        proxy_set_header	Host $host;

        # HTTP 協議升級，用於 WebSocket 連線
        # 內置變數 $http_upgrade 捕獲請求頭 Upgroade，用於 WebSocket 時通常為 websocket
        proxy_set_header	Upgrade $http_upgrade;

        # 請求頭 Connection 與 Upgrade 相匹配，若 Upgrade 無有效值，則自動忽略 Connection
        proxy_set_header	Connection "upgrade";

        # 禁用緩衝
        proxy_buffering		off;

        # 維持長連線
        proxy_read_timeout	86400s;
        proxy_send_timeout	86400s;

---
# /etc/nginx/snippets/koa-blog-static.nginx

# $static_root 來自 /etc/nginx/conf.d/koa-blog-map.conf
alias			$static_root;

        # 開啟 gzip 設定
        gzip 			on;

        # gzip 需要处理的文件（開啟gzip不可缺此設定）
        gzip_types
    			# text/html（默認會進行gzip,若手動寫入,反而會報警告）
    			text/plain
    			text/css
    			text/xml
    			text/javascript
    			application/x-javascript
    			application/xml
    			application/javascript;

        # 執行gzip的門檻（單位byte，可用k代表KB）
        gzip_min_length		1k;

        # 設定ie6不作gzip
        gzip_disable		"MSIE [1-6]\.";

        # 添加響應頭 Vary: Accept-Encoding
        # Vary: Accept-Encoding 用於告知請求鏈上的所有節點，處理此請求 Cache 時，
        # 除了匹配 URI，還需考慮 Accept-Encoding 值。
        # *請求頭 Accept-Encoding 標明請求方支持的壓縮格式。
        # *響應頭 Content-Encoding 標明響應體的壓縮格式。
        gzip_vary		on

---
# /etc/nginx/snippets/koa-blog-error-response.nginx

# 定義 status 400 以上的錯誤處理

# 攔截後端錯誤

# {待補充}後端尚未完善相應配置

# proxy_intercept_errors on;

# {待補充}處理後端連線失敗、超時等錯誤

# 當這些錯誤發生時，嘗試下一個 upstream (如果有的話)

# 如果所有 upstream 都失敗，或者沒有 upstream，Nginx 會產生 50x 錯誤碼，

# 並根據 error_page 指令進行處理。

# proxy_next_upstream error timeout http_500 http_502 http_503 http_504;

# 將所有錯誤碼統一導向通用的錯誤處理命名 location

error_page 400 401 403 404 405 408 409 410 411 412 413 414 415 416 429 499
500 501 502 503 504 505 = $error_response;

# --- 通用錯誤處理的命名 Location ---

location @error_json {

    # 設置響應 Content-Type
    default_type application/json;

    # $status 變數在此處仍然是原始錯誤碼
    if ($status = 400) { return 400 '{"error": 400, "message": "Bad Request"}'; }
    if ($status = 404) { return 404 '{"error": 404, "message": "Not Found"}'; }
    # ....補齊所有需要的 $status 情況....略....
    if ($status = 500) { return 500 '{"error": 500, "message": "Internal Server Error"}'; }
    # 通用回應
    return $status '{"error": '$status', "message": "An unexpected error occurred."}';

}

# 後端伺服器相關配置 /etc/nginx/snippets/koa-blog-backend.nginx
    # 轉發後端
    proxy_pass		$node_host_port;

    # 維持長連線
    proxy_http_version	1.1;

    # 無此配置的情況，請求頭 Host 則為 proxy_pass 值
    proxy_set_header	Host $host;

    # 內置變數 $remote_addr 捕獲請求 ip，Nginx 以自訂請求頭 X-Real-IP 提供該值
    proxy_set_header	X-Real-IP $remote_addr;

    # 內置變數 $proxy_add_x_forwarded_for 將 $remote_addr 添加到現有的請求頭 X-Forwarded-For 的最後方(以,區隔)
    # 若源請求中無 X-Forwarded-For，則此時創建，用於追蹤請求紀錄
    proxy_set_header	X-Forwarded-For $proxy_add_x_forwarded_for;

    # 內置變數 $scheme 捕獲請求協議(HTTP 或 HTTPS)，Nginx 以自訂請求頭 X-Forwarded-proto 提供該值
    proxy_set_header	X-Forwarded-Proto $scheme;



# --- HTML 錯誤頁面檔案的 Location 區塊 ---

location @error_page {
root $static_root;
	try_files	/html/page$status.html /html/page500.html =404;
internal;
}

---

# /etc/nginx/sites-available/dev-koa-blog.nginx

# 反向代理配置(開發、測試環境)

server {
listen 80;
listen [::]:80;

    server_name dev-koa-blog.ccyo.work;

    if ($host = dev-koa-blog.ccyo.work) {
        return 301 https://$host$request_uri;
    }

}

server {
listen [::]:443 ssl; #ipv6only=on;
listen 443 ssl;

    server_name dev-koa-blog.ccyo.work;

    # log 配置
    include /etc/nginx/snippets/koa-blog-log.nginx;
    # 錯誤提示的響應配置
    include /etc/nginx/snippets/koa-blog-error-response.nginx;
    # ssl 相關配置
    include /etc/nginx/snippets/koa-blog-ssl.nginx;

    # 限制請求體大小
    client_max_body_size 10M;

    # HMR(webpack devServer 4- 則為 /__webpack_hmr)
    location /ws {
    # webpack devServer 監聽端口
        proxy_pass		http://localhost:8080;
        proxy_http_version	1.1;
        proxy_set_header	Host $host;
        proxy_set_header	Upgrade $http_upgrade;
        proxy_set_header	Connection "upgrade";
        proxy_buffering		off;
    # 維持長連線
        proxy_read_timeout	86400s;
        proxy_send_timeout	86400s;
    }

    # 靜態資源(開發環境)
    location /dev_public {
        # 轉發 Webpack DevServer
        proxy_pass		http://localhost:8080/dev_public;
        proxy_http_version	1.1;
        proxy_set_header	Host $host;
    }

    # 靜態資源(測試環境)
    location /public {
        alias			$static_root;

    # 開啟 gzip 設定
        gzip 			on;

    # 需要处理的文件（開啟gzip不可缺此設定）
        gzip_types
    			#text/html（默認gzip,若手動寫入,反而會報警告）
    			text/plain
    			text/css
    			text/xml
    			text/javascript
    			application/x-javascript
    			application/xml
    			application/javascript;

    # 執行gzip的門檻（單位byte，可用k代表KB）
        gzip_min_length		1k;

    # 設定ie6不作gzip
        gzip_disable		"MSIE [1-6]\.";

    # 添加響應頭 Vary: Accept-Encoding
    # Vary: Accept-Encoding 用於告知請求鏈上的所有節點，處理此請求 Cache 時，
    # 除了匹配 URI，還需考慮 Accept-Encoding 值。
    # *請求頭 Accept-Encoding 標明請求方支持的壓縮格式。
    # *響應頭 Content-Encoding 標明響應體的壓縮格式。
    gzip_vary		on
    }

    // 後端代理伺服器(ws相關請求)
    location /ccyo_ws {

    # NodeJS 監聽端口
        proxy_pass		$node_host_port;

    # 維持長連線
        proxy_http_version	1.1;

    # 無此配置的情況，請求頭 Host 則為 proxy_pass 值
        proxy_set_header	Host $host;

    # HTTP 協議升級，用於 WebSocket 連線
    # 內置變數 $http_upgrade 捕獲請求頭 Upgroade，用於 WebSocket 時通常為 websocket
        proxy_set_header	Upgrade $http_upgrade;

    # 請求頭 Connection 與 Upgrade 相匹配，若 Upgrade 無有效值，則自動忽略 Connection
        proxy_set_header	Connection "upgrade";

        proxy_buffering		off;

    # 維持長連線
        proxy_read_timeout	86400s;
        proxy_send_timeout	86400s;
    }

    // 後端代理伺服器(其他請求)
    location / {
    # 轉發後端
        proxy_pass		$node_host_port;

    # 維持長連線
        proxy_http_version	1.1;

    # 無此配置的情況，請求頭 Host 則為 proxy_pass 值
        proxy_set_header	Host $host;

    # 內置變數 $remote_addr 捕獲請求 ip，Nginx 以自訂請求頭 X-Real-IP 提供該值
        proxy_set_header	X-Real-IP $remote_addr;

    # 內置變數 $proxy_add_x_forwarded_for 將 $remote_addr 添加到現有的請求頭 X-Forwarded-For 的最後方(以,區隔)
    # 若源請求中無 X-Forwarded-For，則此時創建，用於追蹤請求紀錄
        proxy_set_header	X-Forwarded-For $proxy_add_x_forwarded_for;

    # 內置變數 $scheme 捕獲請求協議(HTTP 或 HTTPS)，Nginx 以自訂請求頭 X-Forwarded-proto 提供該值
        proxy_set_header	X-Forwarded-Proto $scheme;

    # 提供開發測試調適所需要的時間
        proxy_read_timeout	36000s;
        proxy_send_timeout	36000s;
    }

}

---

# /etc/nginx/sites-available/koa-blog.nginx

# 定義反向代理配置(生產環境)

server {
listen 80;
listen [::]:80;

    server_name koa-blog.ccyo.work;

    if ($host = koa-blog.ccyo.work) {
        return 301 https://$host$request_uri;
    }

}

server {
listen [::]:443 ssl; #ipv6only=on;
listen 443 ssl;

    server_name koa-blog.ccyo.work;

    # log 配置
    include /etc/nginx/snippets/koa-blog-log.nginx;
    # 錯誤提示的響應配置
    include /etc/nginx/snippets/koa-blog-error-response.nginx;
    # ssl 相關配置
    include /etc/nginx/snippets/koa-blog-ssl.nginx;

    # 限制請求體大小
    client_max_body_size 10M;

    # 靜態資源
    location /public {
        alias		$static_root;

        gzip		on;
        gzip_types
    		#text/html（默認gzip,若手動寫入,反而會報警告）
    		text/plain
    		text/css
    		text/xml
    		text/javascript
    		application/x-javascript
    		application/xml
    		application/javascript;

        # 執行gzip的門檻（默認單位byte，k=KB）
        gzip_min_length	1k;

        # 設定ie6不作gzip
        gzip_disable	"MSIE [1-6]\.";
        gzip_vary	on;
        gzip_static	on;
    }

    // 後端代理伺服器(ws相關請求)
    location /ccyo_ws {

    # NodeJS 監聽端口
        proxy_pass		$node_host_port;

    # 維持長連線
        proxy_http_version	1.1;

    # 無此配置的情況，請求頭 Host 則為 proxy_pass 值
        proxy_set_header	Host $host;

    # HTTP 協議升級，用於 WebSocket 連線
    # 內置變數 $http_upgrade 捕獲請求頭 Upgroade，用於 WebSocket 時通常為 websocket
        proxy_set_header	Upgrade $http_upgrade;

    # 請求頭 Connection 與 Upgrade 相匹配，若 Upgrade 無有效值，則自動忽略 Connection
        proxy_set_header	Connection "upgrade";

        # ws請求不作緩存
        proxy_buffering		off;

    # 維持長連線
        proxy_read_timeout	86400s;
        proxy_send_timeout	86400s;
    }

    // 後端代理伺服器(其他請求)
    location / {
    # 轉發後端
        proxy_pass		$node_host_port;

    # 維持長連線
        proxy_http_version	1.1;

    # 無此配置的情況，請求頭 Host 則為 proxy_pass 值
        proxy_set_header	Host $host;

    # 內置變數 $remote_addr 捕獲請求 ip，Nginx 以自訂請求頭 X-Real-IP 提供該值
        proxy_set_header	X-Real-IP $remote_addr;

    # 內置變數 $proxy_add_x_forwarded_for 將 $remote_addr 添加到現有的請求頭 X-Forwarded-For 的最後方(以,區隔)
    # 若源請求中無 X-Forwarded-For，則此時創建，用於追蹤請求紀錄
        proxy_set_header	X-Forwarded-For $proxy_add_x_forwarded_for;

    # 內置變數 $scheme 捕獲請求協議(HTTP 或 HTTPS)，Nginx 以自訂請求頭 X-Forwarded-proto 提供該值
        proxy_set_header	X-Forwarded-Proto $scheme;

    # 提供開發測試調適所需要的時間
        proxy_read_timeout	36000s;
        proxy_send_timeout	36000s;
    }

}

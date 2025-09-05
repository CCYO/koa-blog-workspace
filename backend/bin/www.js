#!/usr/bin/env node
/**
 * Module dependencies.
 */

const fs = require("fs");
const { resolve } = require("path");
/* CONFIG     ----------------------------------------------------------------------------- */
//  設定環境變量
const dotenv = require("dotenv");

// 載入共用配置
dotenv.config({ path: resolve(__dirname, `../_config/.env`) });
// 載入當前模式配置
const dotenv_config = resolve(
  __dirname,
  `../_config/.env.${process.env.NODE_ENV}`
);

if (fs.existsSync(dotenv_config)) {
  dotenv.config({
    path: dotenv_config,
    override: true,
  });
}

/* NODEJS     ----------------------------------------------------------------------------- */
const http = require("http");

/* CUSTOM     ----------------------------------------------------------------------------- */
const app = require("../app");

/**
 * Create HTTP server.
 */

let server = http.createServer(app.callback());

/**
 * Listen on provided port, on all network interfaces.
 */
const port = normalizePort(process.env.NODE_PORT);

server.listen(port, "localhost", () => {
  console.log(`監聽:${port}`);
});
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  let bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  let addr = server.address();
  let bind =
    typeof addr === "string"
      ? "pipe " + addr
      : "ADDRESS:PORT: " + `${addr.address}:${addr.port}`;
  console.log(
    `NODE: ${process.version}, MODE: ${process.env.NODE_ENV}, ${bind}`
  );
}

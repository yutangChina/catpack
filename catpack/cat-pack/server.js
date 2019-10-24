/**
 * 建立服务器文件
 */
let http = require('http');
let server_config = require("../config/base.server.config.js");
let router = require("./router.js");
let {
    exec
} = require("child_process");

/**
 * 服务器建立方法
 */
const startServer = function () {
    http.createServer(function (request, response) {
        let req = router.route(request);
        response.writeHead(200, {
            'Content-Type': "text/html;charset=UTF8"
        });
        response.end(req);
    }).listen(server_config.port);
    // 终端打印如下信息
    console.log(`catpack is running at http://127.0.0.1:${server_config.port}/`);


    if (server_config.openBrower) {
        //自动在默认浏览器打开地址
        switch (process.platform) {
            //mac系统使用 一下命令打开url在浏览器
            case "darwin":
                exec(`open http://127.0.0.1:${server_config.port}/`);
                break;
                //win系统使用 一下命令打开url在浏览器
            case "win32":
                exec(`start http://127.0.0.1:${server_config.port}/`);
                break;
                // 默认mac系统
            default:
                exec(`open http://127.0.0.1:${server_config.port}/`);
                break;
        }
    }

}

module.exports = {
    start: startServer
}
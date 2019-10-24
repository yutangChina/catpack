/**
 * 路由文件
 */
const config = require("../config/base.server.config");
const path = require("path");
const fs = require("fs");
const url = require('url');


/**
 * 读取文件夹内的所有文件，并归类
 * @param {*} basePath 
 */
function getFilesInDir(basePath, continer) {
    let pageList = fs.readdirSync(basePath);
    let htmlArr = continer.htmlArr,
        cssArr = continer.cssArr,
        jsArr = continer.jsArr;
    for (let i = 0; i < pageList.length; i++) {
        let pageExtname = path.extname(pageList[i]).toString();
        switch (pageExtname) {
            case ".html":
                htmlArr.push(basePath + path.sep + pageList[i]);
                break;
            case ".css":
                cssArr.push(basePath + path.sep + pageList[i]);
                break;
            case ".js":
                jsArr.push(basePath + path.sep + pageList[i]);
                break;
            case "":
                getFilesInDir(basePath + path.sep + pageList[i], continer);
                break;
        }
    }
    return;
}

module.exports = {
    route: function (res) {
        //catpack所在的基础路径
        let basePath = __filename.substring(0, __filename.indexOf("cat-pack") - 1);
        let myurl = res.url; //请求路径
        if (myurl == "/favicon.ico") return; //返回不需要解析的ico
        const myURL = url.parse(myurl); //解析url
        //公共文件所在路径
        let publicFilePath = basePath + config.publicPath.replace(/\//g, path.sep);
        //获取到页面所在文件的绝对路径
        let webPagePath = basePath + config.webPath.replace(/\//g, path.sep);
        let page = myURL.pathname == "/" ? (path.sep + config.start) : myURL.pathname.replace(/\//g, path.sep);
        let absPath = webPagePath + page;
        let extname = path.extname(absPath);
        let realAbsPath = absPath.replace(extname, "");
        let isExist = fs.existsSync(realAbsPath);
        if (!isExist) return "对应page文件夹必须在pages目录中存在!";
        //读取文件进行组装与返回
        let continer = {
            htmlArr: [],
            cssArr: [],
            jsArr: []
        };
        //1.读取公共文件夹内所有文件
        getFilesInDir(publicFilePath, continer);
        //2.读取页面文件夹内所有文件
        getFilesInDir(realAbsPath, continer);
        //读取文件，每种后缀只能占据一个元素位置
        let docu = {};
        for (let item in continer) {
            let tempArr = continer[item];
            for (let i = 0; i < tempArr.length; i++) {
                let extname = path.extname(tempArr[i]);
                if (docu[extname] == undefined) {
                    docu[extname] = fs.readFileSync(tempArr[i], {
                        encoding: "UTF-8"
                    });
                } else {
                    docu[extname] += fs.readFileSync(tempArr[i], {
                        encoding: "UTF-8"
                    });
                }
            }
        }
        //TODO 文件读完后需要拼接然后返回，这边的规则需要好好想想!!!!   Vue文件引入有问题，需要解决
        let templatePath = basePath + config.template.replace(/\//g, path.sep);
        let templateContent = fs.readFileSync(templatePath, {
            encoding: "UTF-8"
        });
        //读取docu中每个对象
        for (let item in docu) {
            //匹配对应规则
            for (let i = 0; i < config.replaceRules.length; i++) {
                let arr = config.replaceRules[i];
                if (item.match(arr.test)) {
                    //当替换的对象里面有$等字符的时候，会将$是切割正则表达式的第一个括号，所有用一个函数替换一下就可以避免了
                    templateContent = templateContent.replace(arr.palceholder, function () {
                        return docu[item]
                    });
                    break;
                }

            }
        }
        return templateContent;
    }
}
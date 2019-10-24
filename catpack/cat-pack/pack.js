/**
 * 打包程序所在文件
 */
const path = require("path");
const fs = require("fs");
const packConfig = require("../config/base.package.config");
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
    start: function () {

        //1.获取catpack所在基础路径（绝对路径）
        let basePath = __filename.substring(0, __filename.indexOf("cat-pack") - 1);
        //2.公共文件所在路径(例如jquery,vue等)
        let publicFilePath = basePath + packConfig.publicPath.replace(/\//g, path.sep);
        //3.获取需要打包的页面所在的路径(在这里是/cat-pack/src/pages)
        let webPagePath = basePath + packConfig.webPath.replace(/\//g, path.sep);
        //4.最后打包文件所在路径
        let packFinalPath = basePath + packConfig.output.replace(/\//g, path.sep);
        //5.template文件所在路径
        let templatePath = basePath + packConfig.template.replace(/\//g, path.sep);


        //begin 开始打包
        //1.最后打包文件所在的文件夹是否存在
        let isOutputExist = fs.existsSync(packFinalPath);
        if (!isOutputExist) {
            fs.mkdirSync(packFinalPath);
        }
        //2.读取template文件内容，每个页面都要使用，不能被覆盖
        let templateContent = fs.readFileSync(templatePath, {
            encoding: "UTF-8"
        });
        //3.读取公共文件所在部分，公共文件应该先于页面文件写入
        let publicContiner = {
            htmlArr: [],
            cssArr: [],
            jsArr: []
        };
        getFilesInDir(publicFilePath, publicContiner);
        let publicDocu = {};
        for (let item in publicContiner) {
            let tempArr = publicContiner[item];
            for (let i = 0; i < tempArr.length; i++) {
                let extname = path.extname(tempArr[i]);
                if (publicDocu[extname] == undefined) {
                    publicDocu[extname] = fs.readFileSync(tempArr[i], {
                        encoding: "UTF-8"
                    });
                } else {
                    publicDocu[extname] += fs.readFileSync(tempArr[i], {
                        encoding: "UTF-8"
                    });
                }
            }

        }
        //4.遍历页面所在文件夹，获取里面所有页面文件夹，一个文件夹代表一个页面
        let pageList = fs.readdirSync(webPagePath);
        for (let i = 0; i < pageList.length; i++) {
            //如果是文件夹才可以进行打包，文件夹的名字就是最后打包好的页面的名字
            //目前所有页面都是html文件
            if (path.extname(pageList[i]) == "") {
                //接下来就是循环页面文件夹内所有文件，然后并和template文件，进行最后文件的输出
                let continer = {
                    htmlArr: [],
                    cssArr: [],
                    jsArr: []
                };
                getFilesInDir(webPagePath + path.sep + pageList[i], continer);
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
                //将公共文件与页面文件整合起来
                for (let item in publicDocu) {
                    if (docu[item] != undefined) {
                        docu[item] = publicDocu[item] + docu[item];
                    } else {
                        docu[item] = publicDocu[item];
                    }
                }
                //最后完整文件的拼接
                let tempTemplateContent = templateContent;//临时template文件索引
                for (let item in docu) {
                    //匹配对应规则
                    for (let i = 0; i < packConfig.replaceRules.length; i++) {
                        let arr = packConfig.replaceRules[i];
                        if (item.match(arr.test)) {
                            //当替换的对象里面有$等字符的时候，会将$是切割正则表达式的第一个括号，所有用一个函数替换一下就可以避免了
                            tempTemplateContent = tempTemplateContent.replace(arr.palceholder, function () {
                                return docu[item];
                            });
                            break;
                        }

                    }
                }
                //最后文件的写入
                let finalFilePath = packFinalPath + path.sep + pageList[i] + ".html";
                //如果存在就先删除
                if(fs.existsSync(finalFilePath)){
                    fs.unlinkSync(finalFilePath);
                }
                fs.writeFileSync(finalFilePath, tempTemplateContent, {
                    encoding: 'UTF-8'
                });
            }

        }
    }
}
/**
 * 打包基础配置
 */
const baseConfig = require("./base.common.config");
module.exports = {
    /**
     * 页面所在的目录，用/进行分割，不论什么系统，在程序中会自动替换分隔符,该目录地址必须在catpack包下面
     * 在这里面，一个页面就是一个文件夹
     */
    webPath: baseConfig.webPath,
    /**
     * 所有页面使用模板所在位置，用/进行分割，不论什么系统，在程序中会自动替换分隔符,该目录地址必须在catpack包下面\
     * template类似于一个公用模板，所有pages里面的页面都会被填充到template中
     * 所以template放置的内容最好是公用的，例如HTML统一的文档声明，head头里面的内容，等等
     * 其并非类似与jQuery,css公用文件，仅仅是作为最后输出内容的承载体。
     * 公用的文件需要使用 publicPath 参数进行指定。
     * 当然在这个里面你可以写一些公共的东西
     */
    template: baseConfig.template,
    /**
     * 复用文件所在目录，用/进行分割，不论什么系统，在程序中会自动替换分隔符,该目录地址必须在catpack包下面
     * 每个页面都要使用到的文件，例如jQuery,Vue,通用的CSS等
     * 这些文件会被引入到每一个页面里面
     */
    publicPath: baseConfig.publicPath,
    //template文件中不同文件后缀的替换规则，palceholder是写在template中的
    replaceRules: baseConfig.replaceRules,
    //出口，打包到哪个文件夹里面去，默认为catpack下面的web文件夹里面
    output:"/packagemodule"
}
/**
 * User: xingyan
 * Date: 4/18/13
 * Time: 10:26 AM
 */

"use strict";

var o = octopus;

var NEWS_DATA = [
    {
        "m_title" : "梅西获金球奖 4连冠成历史第一人",
        "m_url" : "http:\/\/sports.huanqiu.com\/pictures\/list\/2013-01\/2679090.html",
        "m_image_url" : "../../img/7dd98d1001e939015663bdfa7bec54e737d19694.jpg"
    },{
        "m_title" : "江西种粮大户给农民发百万年终奖",
        "m_url" : "http:\/\/www.chinanews.com\/tp\/hd2011\/2013\/01-08\/163662.shtml#nextpage",
        "m_image_url" : "../../img/83025aafa40f4bfb1628ae90034f78f0f636187d.jpg"
    },{
        "m_title" : "美国前州长和谷歌总裁到达朝鲜",
        "m_url" : "http:\/\/news.ifeng.com\/photo\/hdnews\/detail_2013_01\/08\/20942777_0.shtml#p=1",
        "m_image_url" : "../../img/d52a2834349b033b15bbce1e15ce36d3d439bdc6.jpg"
    },{
        "m_title" : "河南市民送廉政锦旗遭政府拒接",
        "m_url" : "http:\/\/photo.eastday.com\/hdqxb2013\/20130108_3\/index.html",
        "m_image_url" : "../../img/503d269759ee3d6d4903aa0f43166d224e4ade28.jpg"
    },{
        "m_title" : "越南新娘：望乡路远",
        "m_url" : "http:\/\/photo.gmw.cn\/2013-01\/07\/content_6285058.htm#Content_Title",
        "m_image_url" : "../../img/69fe41e918e20e3a3fdbf59ac55e43c3.jpg"
    },{
        "m_title" : "动姐摆\"动车style\"迎蛇年春运",
        "m_url" : "http:\/\/news.cnwest.com\/content\/2013-01\/07\/content_8186183.htm",
        "m_image_url" : "../../img/fd039245d688d43f9e5b12317d1ed21b0ff43b06.jpg"
    },{
        "m_title" : "北京地铁10号线成最拥挤线路",
        "m_url" : "http:\/\/news.xinhuanet.com\/city\/2013-01\/07\/c_124198960.htm",
        "m_image_url" : "../../img/b64543a98226cffc52e93e71b9014a90f703ea36.jpg"
    },{
        "m_title" : "2013央视蛇年春晚主持群确定",
        "m_url" : "http:\/\/www.chinanews.com\/tp\/hd2011\/2013\/01-07\/163508.shtml#nextpage",
        "m_image_url" : "../../img/d53f8794a4c27d1ee87296071bd5ad6edcc43898.jpg"
    },{
        "m_title" : "胡耀邦铜像在浙江大陈岛揭幕",
        "m_url" : "http:\/\/www.ccdy.cn\/xinwen\/wenhua\/xinwen\/201301\/t20130107_520855.htm",
        "m_image_url" : "../../img/6b923a9fdc7448e1f46b2976f184792e.jpg"
    },{
        "m_title" : "大雾致成彭高速20多辆车连环追尾",
        "m_url" : "http:\/\/news.xinmin.cn\/shehui\/2013\/01\/07\/18007771.html",
        "m_image_url" : "../../img/af6a98fd77ed76dc79edb03729d6defb.jpg"
    },{
        "m_title" : "美国会议员合影 后排4人系PS加入",
        "m_url" : "http:\/\/world.huanqiu.com\/well_read\/2013-01\/3453672.html",
        "m_image_url" : "../../img/db0e56d2ebb7b3cfc6d55c06ff189b31.jpg"
    },{
        "m_title" : "江苏太仓窄道两侧建两所豪华公厕",
        "m_url" : "http:\/\/finance.china.com.cn\/news\/photo\/20130107\/3389.shtml?pic=2",
        "m_image_url" : "../../img/dfeb2bf21bcee6a568748a721ef9f06a.jpg"
    },{
        "m_title" : "国足队员佩戴红领巾参加校园活动",
        "m_url" : "http:\/\/www.chinanews.com\/tp\/hd2011\/2013\/01-07\/163447.shtml#nextpage",
        "m_image_url" : "../../img/a9c3b171a058ce86e9418e52bfc69176.jpg"
    },{
        "m_title" : "山西长治苯胺泄漏 触目惊心",
        "m_url" : "http:\/\/pic.news.sohu.com\/911195\/911297\/group-406970.shtml#0",
        "m_image_url" : "../../img/a8773912b31bb051dd2a63ea367adab44bede0e2.jpg"
    },{
        "m_title" : "江苏媒体刊登胡锦涛回乡考察照片",
        "m_url" : "http:\/\/news.ifeng.com\/photo\/hdnews\/detail_2013_01\/06\/20854266_0.shtml#p=1",
        "m_image_url" : "../../img/29381f30e924b899dda8e4fa6e061d950b7bf658.jpg"
    },{
        "m_title" : "朝鲜内部一瞥:金正恩领导的朝鲜",
        "m_url" : "http:\/\/world.gmw.cn\/2013-01\/06\/content_6269998.htm#Content_Title",
        "m_image_url" : "../../img/d62a6059252dd42aa2ccfc69033b5bb5c8eab82f.jpg"
    },{
        "m_title" : "杭州动物园游客持雪球砸狮子取乐",
        "m_url" : "http:\/\/www.china.com.cn\/photochina\/2013-01\/06\/content_27601301.htm",
        "m_image_url" : "../../img/8326cffc1e178a8283218262f603738da877e8d7.jpg"
    },{
        "m_title" : "河北邯郸民众因水污染抢购矿泉水",
        "m_url" : "http:\/\/life.gmw.cn\/2013-01\/06\/content_6264864.htm",
        "m_image_url" : "../../img/37d3d539b6003af3e9e460a2352ac65c1138b692.jpg"
    },{
        "m_title" : "成都机场大雾 上万名旅客滞留 ",
        "m_url" : "http:\/\/www.chinanews.com\/tp\/hd2011\/2013\/01-06\/162961.shtml#nextpage",
        "m_image_url" : "../../img/4e4a20a4462309f721e913d0720e0cf3d6cad66a.jpg"
    },{
        "m_title" : "济南一路段1公里设10组红绿灯",
        "m_url" : "http:\/\/www.china.com.cn\/photochina\/2013-01\/06\/content_27595674.htm",
        "m_image_url" : "../../img/a8ec8a13632762d0ab03417ea0ec08fa513dc636.jpg"
    },{
        "m_title" : "特写：奥巴马的2012",
        "m_url" : "http:\/\/news.xinhuanet.com\/photo\/2013-01\/06\/c_124189526.htm",
        "m_image_url" : "../../img/8cb1cb1349540923f48d2ebc9258d109b2de490f.jpg"
    }
];

var dom1 = document.createElement("div"),
    dom2 = document.createElement("div"),
    dom3 = document.createElement("div"),
    doms = [dom1, dom2, dom3];
dom1.innerHTML = "test1";
dom2.innerHTML = "test2";
dom3.innerHTML = "test3";

/**
 * 配置说明
 * data: 轮播图的数据
 * width: 轮播图的宽度 非必要
 * height: 轮播图的高度 同上
 * children: 一堆节点的数组 可以扔进slider 自动加入轮播组件 children长度不为0 则为dom轮播模式
 * dataField: 一般的数据结构要求为[{title: "", url: "", image_url: ""}] 如果不同的数据key值 可以在此参数中设置
 * isLon: 为true 则纵向轮播 为false则横向
 * isNewTab： 为true 则点击轮播图在新窗口打开 否则页面内打开
 * isDisableA: 为true 则点击轮播图无反应
 * loadImageNumber: 默认生成后拉取的图片张数，－1为全部拉取
 * autoPlayTime: 轮播图的停留时间
 * animationTime: 轮播图滚动后的动画时间
 * animationType: 轮播图的动画类型 为css3值 ease-out ease-in etc.
 * loop: 是否循环轮播true则点击下一页无限循环出现 false则到最后一张 有一个回第一个的动画
 * autoPlay: 是否自动轮播动画行为
 * hasButton: 是否有上一页和下一页的button
 * springBackDis: 手指滑动判定翻页距离
 * TODO 事件部分
 * @type {o.Widget.Slider}
 */
var slider = new o.Widget.Slider({
    data: NEWS_DATA.slice(0, 10),
    /*children: doms,*/
    isLon: false,
    autoPlay: false,
    loop: true,
    supportEvent: false,
    dataField: {
        title: "m_title",
        url: "m_url",
        image_url: "m_image_url"
    }
});
slider.on("slider-ui-afterrender", function(option) {
    console.log(option);
});

slider.on("slider-item-ontap", function(option) {
    console.log(option);
})

o.event.on(window, "ready", onLoadCompleted);



function onLoadCompleted() {
    slider.render("test");
}
/**
 * @file
 * webapp通用组件基础库文件，主要用于通用组件的类结构声明
 * @author oupeng-fe
 * @version 1.1
 */
;(function(window, undefined) {

    "use strict";

    /**
     * 命名空间前缀 🐙
     * @namespace octopus
     * @desc 命名空间说明 所有小写字母开头的方法都可以直接调用 如octopus.easing.linear.easeIn
     * 相反，大写字母开头的命名说明该对象是一个类对象 需要用关键字new 如 new octopus.Widget()
     * @type {object}
     */
    var octopus,
        o = octopus = {version: "1.1"};

    /**
     * @method octopus.define
     * @desc 类生成.将返回一个形如——
     * function C() {
     *      this.initialize()
     * };
     * C.prototype = { constructor: C, ... }的对象
     * 支持两个参数，第一个为父类（可不存在），第二个为生成类的各属性方法对象 由于每个类的生成都基于子类对父类对象的深度拷贝，因此，
     * 为避免子类属性更改对父类造成的不可控影响，除Number|String|Boolean 外的对象 初始化都建议放在构造函数当中去做 初始化值建议
     * 为null
     * @example
     * var newClass = octopus.define({
     *     width: 64,
     *     length: "12px",
     *     property: null,
     *     initialize: function() {
     *         this.property = Object.create({});
     *     }
     * });
     * @return {Function}
     */
    o.define = function() {
        var len = arguments.length,
            s = arguments[0],
            i = arguments[len - 1];

        var nc = typeof i.initialize == "function" ? i.initialize :
            function() {
                s.apply(this, arguments);
        };
        if(len > 1) {
            var newArgs = [nc, s].concat(Array.prototype.slice.call(arguments).slice(1, len - 1), i);
            o.inherit.apply(null, newArgs);
        } else {
            nc.prototype = i;
            nc.prototype.constructor = nc;
        }
        return nc;
    };

    /**
     * @method octopus.inherit
     * @desc 继承
     * @param child {Function} 子类
     * @param father {Function} 父类
     */
    o.inherit = function(child, father) {
        var f = function() {},
            cp,
            fp = father.prototype;
        f.prototype = fp;
        cp = child.prototype = new f;
        cp.constructor = child;
        var i, l, k;
        for(i = 2, l = arguments.length; i < l; i++) {
            k = arguments[i];
            if(typeof k === "function") {
                k = k.prototype;
            }
            o.extend(child.prototype, k);
        }
    };

    /**
     * @method octopus.extend
     * @desc 将一个对象的属性复制给另一个对象
     * @param destination {object}
     * @param source {object}
     * @return destination {object} 复制后的对象
     */
    o.extend = function(destination, source) {
        destination = destination || {};
        if(source) {
            for(var property in source) {
                var value = source[property];
                if(value !== undefined) {
                    destination[property] = value;
                }
            }
            var sourceIsEvt = typeof window.Event == "function"
                && source instanceof window.Event;

            if (!sourceIsEvt && source.hasOwnProperty && source.hasOwnProperty("toString")) {
                destination.toString = source.toString;
            }
        }
        return destination;
    };

    /**
     * @namespace octopus.util
     * @desc 工具集合 相当于jquery的fn
     * @type {object}
     */
    o.util = o.util || {};

    /**
     * @property octopus.util.lastSeqId
     * @type {String}
     */
    o.util.lastSeqId = 0;

    /**
     * @method octopus.util.createUniqueID
     * @param prefix {String} 前缀
     * @return {String} 全局唯一的一个字符串
     */
    o.util.createUniqueID = function(prefix) {
        prefix = (prefix === null || prefix === undefined) ? "octopus" : prefix.replace(/\./g, "_");
        o.util.lastSeqId++;
        return prefix + o.util.lastSeqId;
    };

    window.octopus = o;

    if(typeof module === "object" && typeof module.exports === "object") {
        module.exports = o    
    }

})(window);/**
 * @file
 * webapp通用组件基础库文件
 * util -   工具函数部分
 * @author oupeng-fe
 * @version 1.1
 */
;(function(o, undefined) {

    "use strict";

    /**
     * 避免未声明 octopus.util
     */
    var util = o.util = o.util || {};

    /**
     * @const octopus.util.LEFT {String} "left"
     * @const octopus.util.RIGHT {String} "right"
     * @const octopus.util.UP {String} "up"
     * @const octopus.util.DOWN {String} "down"
     */
    util.LEFT = "left";
    util.RIGHT = "right";
    util.UP = "up";
    util.DOWN = "down";

    /**
     * @method octopus.util.getCenter
     * @param touches {Array}
     * @return {object}
     * @desc 获得所有触摸点的中心
     */
    util.getCenter = function(touches) {
        var valuesX = [], valuesY = [];

        for(var t= 0,len=touches.length; t<len; t++) {
            valuesX.push(touches[t].pageX);
            valuesY.push(touches[t].pageY);
        }

        return {
            pageX: ((Math.min.apply(Math, valuesX) + Math.max.apply(Math, valuesX)) / 2),
            pageY: ((Math.min.apply(Math, valuesY) + Math.max.apply(Math, valuesY)) / 2)
        };
    };

    /**
     * @method octopus.util.getVelocity
     * @desc 获得两点间瞬移速度
     * @param delta_time {Number}
     * @param delta_x {Number}
     * @param delta_y {Number}
     * @return {object} x为横向速度 y为纵向速度
     */
    util.getVelocity = function(delta_time, delta_x, delta_y) {
        return {
            x: Math.abs(delta_x / delta_time) || 0,
            y: Math.abs(delta_y / delta_time) || 0
        };

    };

    /**
     * @method octopus.util.getAngle
     * @desc 获得两点间角度
     * @param touch1 {Object}
     * @param touch2 {Object}
     * @return {Number}
     */
    util.getAngle = function(touch1, touch2) {
        var y = touch2.pageY - touch1.pageY,
            x = touch2.pageX - touch1.pageX;
        return Math.atan2(y, x) * 180 / Math.PI;
    };

    /**
     * @method octopus.util.getDirection
     * @desc 获得触碰滑动方向
     * @param touch1 {Object}
     * @param touch2 {Object}
     * @return {string}
     */
    util.getDirection = function(touch1, touch2) {
        var x = Math.abs(touch1.pageX - touch2.pageX),
            y = Math.abs(touch1.pageY - touch2.pageY);

        if(x >= y) {
            return touch1.pageX - touch2.pageX > 0 ? util.LEFT : util.RIGHT;
        }
        else {
            return touch1.pageY - touch2.pageY > 0 ? util.UP : util.DOWN;
        }
    };

    /**
     * @method octopus.util.getDistance
     * @desc 获得两点间距离
     * @param touch1 {Object}
     * @param touch2 {Object}
     * @return {Number}
     */
    util.getDistance = function(touch1, touch2) {
        var x = touch2.pageX - touch1.pageX,
            y = touch2.pageY - touch1.pageY;
        return Math.sqrt((x * x) + (y * y));
    };

    /**
     * @method octopus.util.getScale
     * @desc 获得两触摸点滑动后得到的两触摸点之于之前的放大倍数
     * @param start {Array}
     * @param end {Array}
     * @return {Number}
     */
    util.getScale = function(start, end) {
        if(start.length >= 2 && end.length >= 2) {
            return this.getDistance(end[0], end[1]) /
                this.getDistance(start[0], start[1]);
        }
        return 1;
    };

    /**
     * @method octopus.util.getRotation
     * @desc 获得两触摸点滑动后得到的两触摸点之于之前的旋转度数
     * @param start {Array}
     * @param end {Array}
     * @return {Number}
     */
    util.getRotation = function(start, end) {
        if(start.length >= 2 && end.length >= 2) {
            return this.getAngle(end[1], end[0]) -
                this.getAngle(start[1], start[0]);
        }
        return 0;
    };

    /**
     * @method octopus.util.encodeHtml
     * @desc 对字符串中的特殊字符进行html编码
     * @param str {String}
     */
    util.encodeHtml = function(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    };

    /**
     * @method octopus.util.decodeHtml
     * @desc 对字符串中的html进行编码
     * @param str {String}
     */
    util.htmlDecodeDict = {"quot": '"', "lt": "<", "gt": ">", "amp": "&", "#39": "'"};
    util.decodeHtml = function(str) {
        return String(str).replace(/&(quot|lt|gt|amp|#39);/ig, function(all, key) {
            return util.htmlDecodeDict[key];
        }).replace(/&#u([a-f\d]{4});/ig, function(all, hex) {
                return String.fromCharCode(parseInt("0x" + hex));
            }).replace(/&#(\d+);/ig, function(all, number) {
                return String.fromCharCode(+number);
            });
    };

    /**
     * @method octopus.util.loadImage
     * @desc 加载图片方法
     * @param url {String} 图片url
     * @param ready {Function} 此时图片没有加载完 但是宽高已知
     * @param load {Function} 图片onload的callback
     * @param error {Function} 图片加载失败的callback
     */
    util.loadImage = (function() {
        var list = [],
            intervalId = null,
        //用来执行队列
            tick = function() {
                var i = 0;
                for (; i < list.length; i++) {
                    list[i].end ? list.splice(i--, 1) : list[i]();
                };
                !list.length && stop();
            },
        // 停止所有定时器队列
            stop = function () {
                clearInterval(intervalId);
                intervalId = null;
            };
        return function (url, ready, load, error) {
            var onready, width, height, newWidth, newHeight,
                img = new Image();
            img.src = url;
            // 如果图片被缓存，则直接返回缓存数据
            if (img.complete) {
                ready.call(img);
                load && load.call(img);
                return;
            };
            width = img.width;
            height = img.height;
            // 加载错误后的事件
            img.onerror = function () {
                error && error.call(img);
                onready.end = true;
                img = img.onload = img.onerror = null;
            };
            // 图片尺寸就绪
            onready = function () {
                newWidth = img.width;
                newHeight = img.height;
                if (newWidth !== width || newHeight !== height || newWidth * newHeight > 1024) {
                    ready.call(img);
                    onready.end = true;
                };
            };
            onready();
            // 完全加载完毕的事件
            img.onload = function () {
                // onload在定时器时间差范围内可能比onready快
                // 这里进行检查并保证onready优先执行
                !onready.end && onready();
                load && load.call(img);
                // IE gif动画会循环执行onload，置空onload即可
                img = img.onload = img.onerror = null;
            };
            // 加入队列中定期执行
            if(!onready.end) {
                list.push(onready);
                // 无论何时只允许出现一个定时器，减少浏览器性能损耗
                if (intervalId === null) intervalId = setInterval(tick, 40);
            };
        };
    })();

    /**
     * @method octopus.util.empty
     * @desc 空函数
     */
    util.empty = function() {};

    /**
     * @method octopus.util.bind
     * @desc 换作用域
     * @param func {Function}
     * @param object {Object}
     */
    util.bind = function(func, object) {
        // create a reference to all arguments past the second one
        var args = Array.prototype.slice.apply(arguments, [2]);
        return function() {
            // Push on any additional arguments from the actual function call.
            // These will come after those sent to the bind call.
            var newArgs = args.concat(
                Array.prototype.slice.apply(arguments, [0])
            );
            return func.apply(object, newArgs);
        };
    };

    /**
     * @method octopus.util.bindAsEventListener
     * @param func {Function} 作为事件监听的函数
     * @param object {Object} 作用域
     */
    util.bindAsEventListener = function(func, object) {
        return function(event) {
            return func.call(object, event || window.event);
        };
    };

    /**
     * @method octopus.util.isNode
     * @desc 判断对象是否是节点
     * @param o {Object}
     * @return {Boolean}
     */
    util.isNode = function(o) {
        return !!(o && o.nodeType === 1);
    };

    /**
     * @method octopus.util.isObject
     * @desc 判断对象是否是对象
     * @return {Boolean}
     */
    util.isObject = function (source) {
        return 'function' == typeof source || !!(source && 'object' == typeof source);
    };

    /**
     * @method octopus.util.isString
     * @desc 判断对象是否是字符串
     * @return {Boolean}
     */
    util.isString = function (source) {
        return '[object String]' == Object.prototype.toString.call(source);
    };

    /**
     * @method octopus.util.isArray
     * @desc 判断对象是否是数组
     * @return {Boolean}
     */
    util.isArray = function(source) {
        return ('[object Array]' == Object.prototype.toString.call(source));
    };

    /**
     * @method octopus.util.isNumeric
     * @desc 判断对象是否是数字
     * @returns {Boolean}
     */
    util.isNumeric = function(obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    };

    /**
     * @method octopus.util.isPlain
     * @desc 判断是否是普通对象 非function
     */
    util.isPlain  = function(obj){
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            key;
        if ( !obj ||
            Object.prototype.toString.call(obj) !== "[object Object]" ||
            !('isPrototypeOf' in obj)
            ) {
            return false;
        }
        if ( obj.constructor &&
            !hasOwnProperty.call(obj, "constructor") &&
            !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
            return false;
        }
        for ( key in obj ) {}
        return key === undefined || hasOwnProperty.call( obj, key );
    };

    /**
     * @method octopus.util.isEmpty
     * @desc 判断传入的参数是否为空，
     *       包括undefined, null, false, number 0,
     *       empty string, string "0", {} and []
     * @returns {Boolean}
     */
    util.isEmpty = function(mixed_var) {
        var undef, key, i, len;
        var emptyValues = [undef, null, false, 0, "", "0"];

        for (i = 0, len = emptyValues.length; i < len; i++) {
            if (mixed_var === emptyValues[i]) {
                return true;
            }
        }

        if (typeof mixed_var === "object") {
            for (key in mixed_var) {
                return false;
            }
            return true;
        }

        return false;
    };

    /**
     * @method octopus.util.clone
     * @desc 深度拷贝一个对象
     * @return 拷贝后的对象
     */
    util.clone = function(source) {
        var result = source, i, len;
        if (!source
            || source instanceof Number
            || source instanceof String
            || source instanceof Boolean) {
            return result;
        } else if(util.isNode(source)) {
            return source.cloneNode(true);
        } else if (util.isArray(source)) {
            result = [];
            var resultLen = 0,
                i = 0,
                len = source.length;
            for (; i < len; i++) {
                result[resultLen++] = util.clone(source[i]);
            }
        } else if (util.isPlain(source)) {
            result = {};
            for (i in source) {
                if (source.hasOwnProperty(i)) {
                    result[i] = util.clone(source[i]);
                }
            }
        }
        return result;
    };

    /**
     * @method octopus.util.each
     * @param source {Array | Object}
     * @param callback {Function}
     * @returns {*}
     * @desc 遍历数组或对象
     */
    util.each = function(source, callback) {
        if(util.isArray(source)) {
            return Array.forEach ? source.forEach(callback) : function(ar, func) {
                var len = ar.length,
                    i = 0;
                for(; i < len; i++) {
                    var result = func.call(this, ar[i], i);
                    if(result === true) break;
                }
            }(source, callback);
        }
        if(util.isObject(source)) {
            for(var k in source) {
                if(source.hasOwnProperty(k)) {
                    var result = callback.call(this, source[k], k);
                    if(result === true) break;
                }
            }
        }
        return false;
    };

    /**
     * @method octopus.util.format
     * @param str {String} 待转换的字符串
     * @param data {} 数据
     * @returns {String}
     */
    util.format = function(str, data) {
        return str.replace(/(#)\{(.*?)\}/g, function(all, flag, param) {
            return data && typeof data[param] != "undefined" ? data[param] : "";
        });
    };

    /**
     * @method octopus.util.applyDefaults
     * @desc 将一个对象里没有的参数复制给另一个对象 与extend的区别在于 如果不会复制已存在属性
     * @param to {Object}
     * @param from {Object}
     */
    util.applyDefaults = function(to, from) {
        to = to || {};
        var fromIsEvt = typeof window.Event == "function"
            && from instanceof window.Event;
        for (var key in from) {
            if(to[key] === undefined ||
                (!fromIsEvt && from.hasOwnProperty
                    && from.hasOwnProperty(key) && !to.hasOwnProperty(key))) {
                to[key] = from[key];
            }
        }
        if(!fromIsEvt && from && from.hasOwnProperty
            && from.hasOwnProperty('toString') && !to.hasOwnProperty('toString')) {
            to.toString = from.toString;
        }
        return to;
    };

    /**
     * @method octopus.util.applyAdd
     * @desc 将一个对象里的参数深度拷贝给另一个对象 如果参数已存在 则覆盖 如果不存在 则追加
     * @param to {Object}
     * @param from  {Object}
     */
    util.applyAdd = function(to, from) {
        to = to || {};
        var fromIsEvt = typeof window.Event == "function"
            && from instanceof window.Event;
        for(var k in from) {
            if(util.isObject(to[k]) && util.isObject(from[k])) {
                to[k] = util.applyAdd(to[k], from[k]);
            } else if(from[k] !== undefined) {
                to[k] = from[k]
            }
        }
        if(!fromIsEvt && from && from.hasOwnProperty
            && from.hasOwnProperty('toString') && !to.hasOwnProperty('toString')) {
            to.toString = from.toString;
        }
        return to;
    };

    /**
     * @method octopus.util.urlAppend
     * @desc 将指定字符串里的内容拼进url
     * @param url {String}
     * @param paramStr {String}
     * @example
     * url = "http://www.google.com";
     * octopus.util.urlAppend(url, "a=1&b=2");
     * return "http://www.google.com?a=1&b=2"
     */
    util.urlAppend = function(url, paramStr) {
        var newUrl = url;
        if(paramStr) {
            var parts = (url + " ").split(/[?&]/);
            newUrl += (parts.pop() === " " ?
                paramStr :
                parts.length ? "&" + paramStr : "?" + paramStr);
        }
        return newUrl;
    };

    /**
     * @method octopus.util.getParameterString
     * @desc 从指定名值对里搞出来字符串形式
     * @param params {Object}
     * @example
     * param = { a: 1, b: 2 }
     * octopus.util.getParameterString(param)
     * return "a=1&b=2"
     */
    util.getParameterString = function(params) {
        var paramsArray = [];
        for (var key in params) {
            var value = params[key];
            if ((value != null) && (typeof value != 'function')) {
                var encodedValue;
                if (typeof value == 'object' && value.constructor == Array) {
                    var encodedItemArray = [];
                    var item;
                    for (var itemIndex=0, len=value.length; itemIndex<len; itemIndex++) {
                        item = value[itemIndex];
                        encodedItemArray.push(encodeURIComponent(
                            (item === null || item === undefined) ? "" : item)
                        );
                    }
                    encodedValue = encodedItemArray.join(",");
                }
                else {
                    encodedValue = encodeURIComponent(value);
                }
                paramsArray.push(encodeURIComponent(key) + "=" + encodedValue);
            }
        }
        return paramsArray.join("&");
    };

    /**
     * @method octopus.util.getParameters
     * @desc 从url中?后的字符串以对象形式返回
     * @param url {String}
     * @example
     * url = "http://www.baidu.com?a=1&b=2"
     * octopus.util.getParameters(url);
     * return { a: 1, b: 2 }
     */
    util.getParameters = function(url) {
        url = (url === null || url === undefined) ? window.location.href : url;
        var paramsString = "";
        if(url.indexOf("?") != -1) {
            var start = url.indexOf('?') + 1;
            var end = url.indexOf("#") != -1 ?
                url.indexOf('#') : url.length;
            paramsString = url.substring(start, end);
        }
        var parameters = {};
        var pairs = paramsString.split(/[&;]/),
            i = 0,
            len = pairs.length;
        for( ; i < len; i++) {
            var keyValue = pairs[i].split('=');
            if(keyValue[0]) {
                var key = keyValue[0];
                try {
                    key = decodeURIComponent(key);
                } catch (err) {
                    key = unescape(key);
                }
                var value = (keyValue[1] || '').replace(/\+/g, " ");
                try {
                    value = decodeURIComponent(value);
                } catch (err) {
                    value = unescape(value);
                }
                value = value.split(",");
                if (value.length == 1) {
                    value = value[0];
                }
                parameters[key] = value;
            }
        }
        return parameters;
    };

    /**
     * @method octopus.util.createUrlObject
     * @desc 创建一个url对象的名值对
     * 里面按照w3c url标准提供了每一个的值
     * @example
     * url = "http://www.google.com?a=1&b=2#abc=1";
     * octopus.util.createUrlObject(url);
     * return
     * {
     *  args: Object,
     *  a: "1",
     *  b: "2",
     *  hash: "#abc=1",
     *  host: "www.google.com",
     *  pathname: "/",
     *  port: "80",
     *  protocol: "http:",
     * }
     */
    util.createUrlObject = function(url, options) {
        options = options || {};
        url = url || window.location.href;
        if(!(/^\w+:\/\//).test(url)) {
            var loc = window.location;
            var port = loc.port ? ":" + loc.port : "";
            var fullUrl = loc.protocol + "//" + loc.host.split(":").shift() + port;
            if(url.indexOf("/") === 0) {
                url = fullUrl + url;
            } else {
                var parts = loc.pathname.split("/");
                parts.pop();
                url = fullUrl + parts.join("/") + "/" + url;
            }
        }
        if (options.ignoreCase) {
            url = url.toLowerCase();
        }
        var a = document.createElement('a');
        a.href = url;
        var urlObject = {};
        urlObject.host = a.host.split(":").shift();
        urlObject.protocol = a.protocol;
        if(options.ignorePort80) {
            urlObject.port = (a.port == "80" || a.port == "0") ? "" : a.port;
        } else {
            urlObject.port = (a.port == "" || a.port == "0") ? "80" : a.port;
        }

        //hash
        urlObject.hash = (options.ignoreHash || a.hash === "#") ? "" : a.hash;
        var queryString = a.search;
        if (!queryString) {
            var qMark = url.indexOf("?");
            queryString = (qMark != -1) ? url.substr(qMark) : "";
        }
        urlObject.args = util.getParameters(queryString);
        urlObject.pathname = (a.pathname.charAt(0) == "/") ? a.pathname : "/" + a.pathname;
        return urlObject;
    };

    /**
     * @method octopus.util.trim
     * @desc 去掉字符串两侧空白
     * @param str {String}
     */
    util.trim = function(str) {
        str = String(str);
        return !!str.trim ? str.trim() : str.replace(new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g"), '');
    };


    /**
     * @method octopus.util.removeItem
     * @param source
     * @param item
     */
    util.removeItem = function(source, item) {
        var len = source.length,
            i = len;
        for(; i--; ) {
            if(source[i] === item) {
                source.splice(i, 1);
            }
        }
        return source;
    };

    /**
     * @method octopus.util.upperCaseObject
     * @desc 将指定对象里的key首字母大写
     * @param object {Object}
     */
    util.upperCaseObject = function (object) {
        var uObject = {};
        for (var key in object) {
            uObject[key.toUpperCase()] = object[key];
        }
        return uObject;
    };

    /**
     * @method octopus.util.camelize
     * @desc 驼峰化字符串
     * @param source {String}
     */
    util.camelize = function(source) {
        var oStringList = source.split(/[\-|_|\s|\.]/g);
        var camelizedString = oStringList[0],
            i = 1,
            len = oStringList.length;
        for ( ; i < len; i++) {
            var s = oStringList[i];
            camelizedString += s.charAt(0).toUpperCase() + s.substring(1);
        }
        return camelizedString;
    };

    /**
     * @method octopus.util.styleCss
     * @desc 将前缀类css 样式化
     * @example
     * var css = "-webkit-transition";
     * octopus.util.styleCss(css);
     * return "webkitTransition"
     */
    util.styleCss = function(str) {
        var flag = true;
        var str = str.replace(/\-(\S)/g, function($1, $2) {
            return flag ? (flag = false, $2) : $2.toUpperCase();
        });
        return str;
    };

    /**
     * @method octopus.util.cssStyle
     * @desc 将样式化的前缀 css化
     * @example
     * var style = "webkitTransition"
     * octopus.util.cssStyle(style);
     * return -webkit-transition
     */
    util.cssStyle = function(str) {
        var str = str.replace(/(^\S|[A-Z])/g, function($1) {
            return "-" + $1.toLowerCase();
        });
        return str;
    };

    /**
     * @method octopus.util.requestAnimation
     */
    util.requestAnimation = (function() {
        var request = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback, element) {
                window.setTimeout(callback, 16);
            };
        return function(callback, element) {
            request.apply(window, [callback, element]);
        };
    })();
})(octopus);/**
 * @file
 * @author oupeng-fe
 * @version 1.1
 * webapp通用组件基础库
 * ajax方法
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/dom.js
 */
;(function (o, undefined) {

    o.ajax = o.ajax || {};

    /**
     * @namespace octopus.ajax
     * @desc ajax请求方法
     */
    o.extend(o.ajax, {

        /**
         * @private
         * @property DEFAULT_CONFIG
         * @type {Object}
         * @desc 配置项
         * type - {String} GET, POST, PUT, DELETE, HEAD, OPTIONS. 默认是GET.
         * url - {String} 请求的地址
         * async - {Boolean} 是否同步请求  默认是true.
         * user - {String} 用户名
         * password - {String} 密码
         * data - {String | Object} POST与PUT提交的数据
         * complete - {Function}
         * success - {Function}
         * error - {Function}
         * scope - {Object}
         * beforeSend   -   {Function} 请求发出前调用
         * timeout  -   {Number} 延时
         */
        DEFAULT_CONFIG: {
            type: "GET",
            url: window.location.href,
            async: true,
            user: undefined,
            password: undefined,
            data: null,
            complete: o.util.empty,
            success: null,
            error: null,
            scope: null,
            beforeSend: null,
            timeout: 0,
            crossDomain: false
        },

        jsonpID: 0,

        jsonType: 'application/json',
        htmlType: 'text/html',

        SCRIPT_REGEX: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        SCRIPT_TYPE_REGEX: /^(?:text|application)\/javascript/i,
        XML_TYPE_REGEX: /^(?:text|application)\/xml/i,
        URL_SPLIT_REGEX: /([^:]*:)\/\/([^:]*:?[^@]*@)?([^:\/\?]*):?([^\/\?]*)/,
        BLANK_REGEX: /^\s*$/,
        accepts: {
            script: 'text/javascript, application/javascript',
            json:   this.jsonType,
            xml:    'application/xml, text/xml',
            html:   this.htmlType,
            text:   'text/plain'
        },

        /**
         * @private
         * @property xhr
         * @type {Function}
         */
        xhr: function() { return new window.XMLHttpRequest(); },

        /**
         * @private
         * @method mimeToDataType
         */
        mimeToDataType: function(mime) {
            return mime && ( mime == this.htmlType ? 'html' :
                mime == this.jsonType ? 'json' :
                    this.SCRIPT_TYPE_REGEX.test(mime) ? 'script' :
                        this.XML_TYPE_REGEX.test(mime) && 'xml' ) || 'text'
        },

        /**
         * @private
         * @method request
         * @desc 发出请求 各种
         * @param options {Object} 配置项
         * @return {XMLHttpRequest}
         */
        request: function(options) {
            var defaultConfig = this.DEFAULT_CONFIG,
                config = o.util.applyDefaults(options, defaultConfig),
                dataType = config.dataType,
                url = config.url,
                data = config.data || {},
                headers = config.headers || {},
                urlobj = o.util.createUrlObject(url);
            if(config.type == "jsonp") {
                return o.ajax.ajaxJSONP(options);
            }
            if(!config.crossDomain) {
                config.crossDomain = urlobj.host != window.location.host;
            }
            var customRequestedWithHeader = false,
                headerKey;
            for(headerKey in headers) {
                if (headerKey.toLowerCase() === 'x-requested-with') {
                    customRequestedWithHeader = true;
                }
            }
            if(customRequestedWithHeader === false || !config.crossDomain) {
                headers['X-Requested-With'] = 'XMLHttpRequest';
            }
            data =  o.util.getParameterString(data || {});
            if(config.type != "POST") {
                config.url = o.util.urlAppend(url, data);
            }
            var mime = this.accepts[dataType],
                baseHeaders = {},
                xhr = this.xhr(), abortTimeout;
            if(mime) {
                baseHeaders['Accept'] = mime;
                if(mime.indexOf(',') > -1) {
                    mime = mime.split(',', 2)[0];
                }
                xhr.overrideMimeType && xhr.overrideMimeType(mime)
            }
            headers = o.extend(baseHeaders, headers || {});
            xhr.open(
                config.type, config.url, config.async, config.user, config.password
            );
            for(var header in headers) {
                xhr.setRequestHeader(header, headers[header]);
            }
            var that = this;
            xhr.onreadystatechange = function() {
                if(xhr.readyState == 4) {
                    clearTimeout(abortTimeout);
                    that.runCallbacks(
                        {request: xhr, config: config, requestUrl: config.url}
                    );
                }
            };
            if(config.async === false) {
                xhr.send(data ? data : null);
            } else {
                window.setTimeout(function(){
                    if(xhr.readyState !== 0) { // W3C: 0-UNSENT
                        xhr.send(data ? data : null);
                    }
                }, 0);
            }
            if(config.timeout > 0) {
                abortTimeout = setTimeout(function(){
                    xhr.onreadystatechange = o.util.empty;
                    xhr.abort()
                    var error;
                    if(config.error) {
                        error = (config.scope) ?
                            o.util.bind(config.error, config.scope) :
                            config.error;
                    }
                    error(xhr, "timeout");
                }, config.timeout)
            }
            return xhr;
        },

        /**
         * @private
         * @method runCallbacks
         * @param options {Object}
         */
        runCallbacks: function(options) {
            var request = options.request;
            var config = options.config;
            var complete = (config.scope) ?
                o.util.bind(config.complete, config.scope) :
                config.complete;
            var success;
            if(config.success) {
                success = (config.scope) ?
                    o.util.bind(config.success, config.scope) :
                    config.success;
            }
            var failure;
            if(config.error) {
                failure = (config.scope) ?
                    o.util.bind(config.error, config.scope) :
                    config.error;
            }
            complete(request);
            var result, error = false,
                dataType = config.dataType;
            if((request.status >= 200 && request.status < 300) || request.status == 304 ||
                (request.status == 0 && o.util.createUrlObject(config.url).protocol == "file:")) {
                dataType = dataType || this.mimeToDataType(request.getResponseHeader('content-type'));
                result = request.responseText;
                try {
                    if(dataType == 'script')    (1,eval)(result)
                    else if(dataType == 'xml')  result = request.responseXML
                    else if(dataType == 'json') result = this.BLANK_REGEX.test(result) ? null : JSON.parse(result)
                } catch (e) { error = e }
                options.result = result;
                if(success) {
                    success(request, result);
                }
            } else {
                if(failure) {
                    failure(request, "error");
                }
            }
        },

        /**
         * @public
         * @method octopus.ajax.get
         * @desc 发条get请求
         * @param config {Object}
         * @param config.url {String} 请求地址
         * @param config.async {Boolean} 同异步
         * @param config.complete {Function} 请求结束的callback
         * @param config.success {Function} 请求成功的callback
         * @param config.error {Function} 请求失败的callback
         * @param config.timeout {Number} 超时时间
         * @return {XMLHttpRequest} Request object.
         */
        "get": function(config) {
            config = o.extend(config, {type: "GET"});
            return o.ajax.request(config);
        },

        /**
         * @public
         * @method octopus.ajax.post
         * @desc 发条post请求
         * @param config {Object} 同get
         * @param config.data {Object} 数据
         * @return {XMLHttpRequest} Request object.
         */
        post: function(config) {
            config = o.extend(config, {type: "POST"});
            // set content type to application/xml if it isn't already set
            config.headers = config.headers ? config.headers : {};
            if(!("CONTENT-TYPE" in o.util.upperCaseObject(config.headers))) {
                config.headers["Content-Type"] = "application/xml";
            }
            return o.ajax.request(config);
        },

        /**
         * @public
         * @method octopus.ajax.put
         * @desc 发条put请求
         * @param config {Object} 同post
         * @return {XMLHttpRequest} Request object.
         */
        put: function(config) {
            config = o.extend(config, {type: "PUT"});
            // set content type to application/xml if it isn't already set
            config.headers = config.headers ? config.headers : {};
            if(!("CONTENT-TYPE" in o.util.upperCaseObject(config.headers))) {
                config.headers["Content-Type"] = "application/xml";
            }
            return o.ajax.request(config);
        },

        /**
         * @public
         * @method octopus.ajax.delete
         * @desc 发条delete请求
         * @param config {Object} 同get
         * @return {XMLHttpRequest} Request object.
         */
        "delete": function(config) {
            config = o.extend(config, {type: "DELETE"});
            return o.ajax.request(config);
        },

        /**
         * @public
         * @method octopus.ajax.head
         * @desc 发条head请求
         * @param config {Object} 同get
         * @return {XMLHttpRequest} Request object.
         */
        head: function(config) {
            config = o.extend(config, {type: "HEAD"});
            return o.ajax.request(config);
        },

        /**
         * @public
         * @method octopus.ajax.options
         * @desc 发条options请求.
         * @param config {Object} 同get
         * @return {XMLHttpRequest} Request object.
         */
        options: function(config) {
            config = o.extend(config, {type: "OPTIONS"});
            return o.ajax.request(config);
        },

        /**
         * @private
         * @method _createScriptTag
         */
        _createScriptTag: function(scr, url, charset) {
            scr.setAttribute('type', 'text/javascript');
            charset && scr.setAttribute('charset', charset);
            scr.setAttribute('src', url);
            document.getElementsByTagName('head')[0].appendChild(scr);
        },

        /**
         * @private
         * @Method _removeScriptTag
         */
        _removeScriptTag: function(scr) {
            if (scr.clearAttributes) {
                scr.clearAttributes();
            } else {
                for (var attr in scr) {
                    if (scr.hasOwnProperty(attr)) {
                        delete scr[attr];
                    }
                }
            }
            if(scr && scr.parentNode){
                scr.parentNode.removeChild(scr);
            }
            scr = null;
            delete scr;
        },

        /**
         * @public
         * @method octopus.ajax.ajaxJSONP
         * @param options {Object}
         * @param options.url {String} 请求地址
         * @param options.complete {Function} 成功回调
         * @param options.error {Function} 失败回调
         * @param options.timeout {Number} 超时时长
         */
        ajaxJSONP: function(options) {
            var script = document.createElement('script'),
                defaultConfig = this.DEFAULT_CONFIG,
                prefix = "jsonp",
                callbackName,
                options = o.util.applyDefaults(options, defaultConfig),
                charset = options['charset'],
                data = options["data"] || {},
                timeOut = options['timeout'] || 0,
                timer,
                that = this,
                url = options["url"],
                callback = options["success"] || options["complete"],
                jsonpName = options["jsonp"] || "callback",
                error = options["error"] || o.util.empty;
            if(o.util.isString(callback)) {
                callbackName = callback;
            } else {
                callbackName = prefix + Math.floor(Math.random() * 2147483648).toString(36);
                window[callbackName] = getCallBack(0);
            }
            if(timeOut > 0){
                timer = setTimeout(getCallBack(1), timeOut);
            }
            script.onerror = function() {
                that._removeScriptTag(script);
                if(callbackName in window) {
                    window[callbackName] = function(){};
                }
                error();
            };
            url = o.util.urlAppend(o.util.urlAppend(url,
                o.util.getParameterString(data || {})), jsonpName + "=" + callbackName);
            this._createScriptTag(script, url, charset);
            function getCallBack(onTimeOut) {
                return function() {
                    try {
                        if( onTimeOut ) {
                            error();
                        } else {
                            clearTimeout(timer);
                            callback.apply(window, arguments);
                        }
                        window[callbackName] = o.util.empty;
                    } catch (exception) {}
                    finally {
                        that._removeScriptTag(script);
                    }
                }
            }
            return options["xhr"];
        }
    });
})(octopus);
/**
 * @file
 * webapp通用组件基础库文件
 * dom -   dom操作部分
 * @require lib/class.js
 * @require lib/util.js
 * @author oupeng-fe
 * @version 1.1
 */
;(function(o, undefined) {

    "use strict";

    var
        /**
         * @desc 工具函数的命名空间
         */
        u = o.util,

        /**
         * @desc 声明document
         */
        doc = document;

    function getScreenBy(t) {
        var v = window["inner" + t],
            _v = (u.isNumeric(v) && v > 0) ? v :
                (doc.compatMode == "CSS1Compat") ? doc.documentElement["client" + t] : o.dom["get" + t](doc.body);
        return _v > 0 ? _v : 0;
    }

    /**
     * @namespace octopus.dom
     * @desc 一些基础的dom操作
     */
    o.dom = {
        /**
         * @method octopus.dom.g
         * @param el
         * @desc 靠id拿个节点 由于只是简单支持 没有必要写得那么高级
         */
        g: function(el) {
            var el = (u.isString(el) ? doc.getElementById(el) : (u.isObject(el) && el));
            return el || null;
        },

        /**
         * @method octopus.dom.$
         * @param filter
         * @param el
         * @desc 不想重复的去写这么多 拿到一个节点集合
         */
        $: function(filter, el) {
            var el = el || doc,
                _el = o.g(el);
            return (o.util.isNode(_el) || _el == doc) ? _el.querySelectorAll(filter) : null;
        },

        /**
         * @method octopus.dom.one
         * @param filter
         * @param el
         * @desc 拿到指定节点下的文档流里的第一个节点
         */
        one: function(filter, el) {
            var el = el || doc,
                _el = o.g(el);
            return (o.util.isNode(_el) || _el == doc) ? _el.querySelector(filter) : null;
        },

        /**
         * @method octopus.dom.hasClass
         * @desc 判断节点有class
         * @param el {DOMElement}
         * @param name {String}
         */
        hasClass: function(el, name) {
            el = o.g(el);
            var names;
            return !!el.classList ? el.classList.contains(name) :
                (names = el.className, !!names && new RegExp("(^|\\s)" + name + "(\\s|$)").test(names));
        },

        /**
         * @method octopus.dom.addClass
         * @desc 给指定节点增加class
         * @param el {DOMElement}
         * @param name {String}
         */
        addClass: function(el, name) {
            el = o.g(el);
            name = name || null;
            if(!name)   return false;
            var classList = el.classList;
            if(!!classList) {
                if(!classList.contains(name)) {
                    el.classList.add(name);
                }
            } else {
                if(!o.dom.hasClass(el, name)) {
                    el.className += (el.className ? " " : "") + name;
                }
            }
            return el;
        },

        /**
         * @method octopus.dom.removeClass
         * @desc 删除指定节点的指定class
         * @param el {DOMElement}
         * @param name {String}
         */
        removeClass: function(el, name) {
            el = o.g(el);
            var names,
                classList = el.classList;
            if(!!classList) {
                if(classList.contains(name)) {
                    el.classList.remove(name);
                }
            } else {
                if(o.dom.hasClass(el, name)) {
                    names = el.className;
                    if(names) {
                        el.className = u.trim(names).replace(
                            new RegExp("(^|\\s+)" + name + "(\\s+|$)"), " "
                        );
                    }
                }
            }
            return el;
        },

        /**
         * @method octopus.dom.toggleClass
         * @desc toggle指定节点的指定样式
         * @param el {DOMElement | String} 指定节点
         * @param name {String} 指定样式
         */
        toggleClass: function(el, name) {
            el = o.g(el);
            var t = o.dom.hasClass(el, name);
            if(t) {
                o.dom.removeClass(el, name);
            } else {
                o.dom.addClass(el, name);
            }
            return !t;
        },

        /**
         * @method octopus.dom.getWidth
         * @desc 获得指定节点的宽度
         * @param el {DOMElement}
         */
        getWidth: function(el) {
            var el = o.g(el);
            var width = !!el.offsetWidth ? el.offsetWidth : el.clientWidth;
            return width > 0 ? width : 0;
        },

        /**
         * @method octopus.dom.getScreenWidth
         * @returns {number}
         * @desc 获得屏幕宽度
         */
        getScreenWidth: function() {
            return getScreenBy("Width");
        },

        /**
         * @method octopus.dom.getScreenHeight
         * @returns {number}
         * @desc 获得屏幕高度
         */
        getScreenHeight: function() {
            return getScreenBy("Height");
        },

        /**
         * @method octopus.dom.getHeight
         * @desc 获得指定节点高度
         * @param el {DOMElement}
         */
        getHeight: function(el) {
            var el = o.g(el);
            var height = !!el.offsetHeight ? el.offsetHeight : el.clientHeight;
            return height > 0 ? height : 0;
        },

        /**
         * @method octopus.dom.insertAfter
         * @desc 插到指定节点后面
         * @param newdom {DOMElement}
         * @param tardom {DOMElement}
         */
        insertAfter: function(newdom, tardom) {
            newdom = o.g(newdom);
            tardom = o.g(tardom);
            tardom.parentNode.insertBefore(newdom, tardom.nextSibling);
            return newdom;
        },

        /**
         * @method octopus.dom.insertFirst
         * @param el
         * @param container
         */
        insertFirst: function(el, container) {
            var el = o.g(el),
                container = o.g(container),
                firstChild = container.firstChild;
            if(!firstChild) {
                container.appendChild(el);
            } else {
                container.insertBefore(el, firstChild);
            }
        },

        /**
         * @method octopus.dom.setStyles
         * @desc 批量赋值
         * @param el {DOMElement}
         * @param obj {Object}
         * @param isinit {Boolean}
         */
        setStyles: function(el, obj, isinit) {
            isinit = isinit || false;
            el = o.g(el);
            if(isinit) {
                var cssText = "";
            }
            for(var k in obj) {
                if(!isinit) {
                    var _k = k;
                    if(k.match(/^-(webkit|o|ms|moz)/g)) {
                        _k  = u.styleCss(k);
                    }
                    el.style[_k] = obj[k];
                    continue;
                }
                cssText += k + ": " + obj[k] + ";";
            }
            if(!!cssText) {
                el.style.cssText = cssText;
            }
        },

        /**
         * @method octopus.dom.getStyle
         * @desc 获取指定节点的指定属性值
         * @param el {DOMElement}
         * @param style {String}
         */
        getStyle: function(el, style) {
            el = o.g(el);
            var value = null;
            if (el && el.style) {
                value = el.style[u.camelize(style)];
                if (!value) {
                    if (doc.defaultView &&
                        doc.defaultView.getComputedStyle) {
                        var css = doc.defaultView.getComputedStyle(el, null);
                        value = css ? css.getPropertyValue(style) : null;
                    } else if (el.currentStyle) {
                        value = el.currentStyle[u.camelize(style)];
                    }
                }
                var positions = ['left', 'top', 'right', 'bottom'];
                if (window.opera &&
                    (positions.indexOf(style) != -1) &&
                    (o.dom.getStyle(el, 'position') == 'static')) {
                    value = 'auto';
                }
            }
            return value == 'auto' ? null : value;
        },

        /**
         * @method octopus.dom.getParentNode
         * @desc 查询符合条件的离指定节点最近的父节点
         * @param el {DOMELement | String} 被查找的起始节点
         * @param filter {String} 筛选器
         * @param maxDepth {Number} 查看的最深层数
         */
        getParentNode: function(el, filter, maxDepth) {
            var el = o.g(el);
            maxDepth = maxDepth || 50;
            var depth = 0,
                _el = null;
            el = el.parentNode;
            while(u.isNode(el) && (depth < maxDepth)) {
                var parent = el.parentNode,
                    list = parent.querySelectorAll(filter);
                if(list && list.length > 0) {
                    u.each(list, function(item) {
                        if(u.isNode(item) && item == el) {
                            _el = item;
                            return true;
                        }
                    });
                }
                el = el.parentNode;
                if(_el || el.tagName == "HTML")	break;
                depth++;
            }
            return _el;
        },

        /**
         * @method octopus.dom.getPosition
         * @desc 获得元素相对于浏览器左上角的坐标
         * @param el {DOMElement}
         */
        getPosition: function(el) {
            el = o.g(el);
            var doc = !!el.ownerDocument ? el.ownerDocument : el,
                getStyle = o.dom.getStyle,
                pos = {"left": 0, "top": 0},
                viewport = doc.documentElement,
                parent = el;
            if(el == viewport){
                return pos;
            }
            do {
                pos.left += parent.offsetLeft;
                pos.top  += parent.offsetTop;
                if (getStyle(parent, 'position') == 'fixed') {
                    pos.left += doc.body.scrollLeft;
                    pos.top  += doc.body.scrollTop;
                    break;
                }
                parent = parent.offsetParent;
            } while (parent && parent != el);
            if(getStyle(el, 'position') == 'absolute'){
                pos.top  -= doc.body.offsetTop;
            }
            parent = el.offsetParent;
            while (parent && parent != doc.body) {
                pos.left -= parent.scrollLeft;
                if (parent.tagName != 'TR') {
                    pos.top -= parent.scrollTop;
                }
                parent = parent.offsetParent;
            }
            return pos;
        },

        /**
         * @method octopus.dom.createDom
         * @desc 创建dom节点
         * @param type {String} dom类型
         * @param atts {Object} dom属性名值对
         * @param stys {Object} dom样式名值对
         */
        createDom: function(type, atts, stys) {
            var dom = doc.createElement(type);
            atts && u.each(atts, function(v, att) {
                if(att == "innerHTML" || att == "innerText") {
                    dom[att] = o.util.encodeHtml(v);
                } else {
                    dom.setAttribute(att, v);
                }
            });
            stys && o.dom.setStyles(dom, stys, true);
            return dom;
        },

        /**
         * @method octopus.dom.cloneNode
         * @desc clone节点 可以将事件一起clone 该事件必须是通过此框架加上的
         * @param el {DOMElement} 待clone的节点
         * @param ev {Boolean} 是否clone事件监听
         * @param c {Boolean} 是否拷贝子节点
         */
        cloneNode: function(el, ev, c) {
            ev = ev || false;
            c = c || false;
            var cloneEl = o.g(el).cloneNode(!c);
            if(!ev || !el._eventCacheID) return cloneEl;
            var obs = o.event.observers[el._eventCacheID];
            u.each(obs, function(item, i) {
                var name = item.name,
                    observer = u.clone(item.observer),
                    useCapture = u.clone(item.useCapture);
                o.event.on(cloneEl, name, observer, useCapture);
            });
            return cloneEl;
        },

        /**
         * @method octopus.dom.scrollLite
         * @desc 针对ios设备滚动条滚动时事件传播方向导致的滚动异常解决
         * @param el {DOMElement} 滚动的节点
         * @param isHorizon {Boolean} 是否横向
         * @param preventFrom {DOMElement} 引起bug的根源容器 可不传
         *
         */
        scrollLite: function(el, isHorizon, preventFrom) {
            var pos = { left: 0, top: 0 };
            if(preventFrom) {
                preventFrom = o.g(preventFrom);
                o.event.on(preventFrom, "touchmove", function(e) { o.event.stop(e, true); }, false);
            }
            el = o.g(el);
            o.dom.setStyles(el, {
                "-webkit-overflow-scrolling": "touch"
            });
            o.event.on(el, "touchstart", function(e) {
                var touches = e.touches;
                if(!touches)    return;
                pos = {
                    left: touches[0].pageX,
                    top: touches[0].pageY
                }
            });
            o.event.on(el, "touchmove", function(e) {
                var touches = e.touches;
                if(!touches)    return;
                var target = e.currentTarget,
                    scrollTop = target.scrollTop,
                    scrollLeft = target.scrollLeft,
                    moveLeft = touches[0].pageX,
                    moveTop = touches[0].pageY,
                    startTop = pos.top,
                    startLeft = pos.left;
                if(isHorizon) {
                    if((scrollLeft <= 0 && moveLeft > startLeft) ||
                        (scrollLeft >= target.scrollWidth - target.clientWidth - 5 && moveLeft < startLeft)) {
                        e.preventDefault();
                        return;
                    }
                    e.stopPropagation();
                } else {
                    if((scrollTop <= 0 && moveTop > startTop) ||
                        (scrollTop >= target.scrollHeight - target.clientHeight - 5 && moveTop < startTop)) {
                        e.preventDefault();
                        return;
                    }
                    e.stopPropagation();
                }

            });
        },

        /**
         * @public
         * @method octopus.dom.data
         * @desc 读取或设置指定节点的数据
         * @param el {String | DOMELement}
         * @param attrs {String | Array}
         */
        data: function(el, attrs) {
            var vs = {};
            el = o.g(el);
            if(u.isString(attrs)) {
                var ars = attrs.split(" "),
                    len = ars.length;
                if(len == 1) {
                    return el.dataset && el.dataset[ars[0]] || el.getAttribute("data-" + ars[0]) || null;
                } else {
                    u.each(ars, function(item) {
                        var _item = u.camelize(item);
                        vs[item] = el.dataset && el.dataset[_item] || el.getAttribute("data-" + item) || null;
                    });
                }
            } else {
                vs = attrs;
                for(var k in vs) {
                    el.setAttribute("data-" + k, vs[k]);
                }
            }
            return vs;
        },

        /**
         * @public
         * @method octopus.dom.attr
         * @desc 读取或设置指定节点的属性
         */
        attr: function(el, attrs) {
            var vs = {};
            el = o.g(el);
            if(u.isString(attrs)) {
                var ars = attrs.split(" "),
                    len = ars.length;
                if(len == 1) {
                    return el.getAttribute(ars[0]) || null;
                } else {
                    u.each(ars, function(item) {
                        vs[item] = el.getAttribute(item) || null;
                    });
                }
            } else {
                vs = attrs;
                for(var k in vs) {
                    el.setAttribute(k, vs[k]);
                }
            }
            return vs;
        }
    };

    /**
     * @desc 将常用的选择器方法的命名空间提前
     */
    o.g = o.dom.g;

    o.$ = o.dom.$;

    o.one = o.dom.one;

    !window.$ && (window.$ = o.$);

})(octopus);
/**
 * @file
 * webapp通用组件基础库文件
 * 事件部分 －   event
 * @require lib/class.js
 * @require lib/util.js
 * @author oupeng-fe
 * @version 1.1
 */
;(function(o, undefined) {

    "use strict";

    /**
     * 定义库内事件支撑
     * @namespace octopus.event
     * @type {object}
     */
    o.event = {

        /**
         * @property observers
         * @desc 一个缓存事件监听的hash表
         * @type {object}
         */
        observers: null,

        /**
         * @method octopus.event.element
         * @desc 返回事件的节点
         * @param event {window.event}
         * @return 触发事件的节点 {DOMElement}
         */
        element: function(event) {
            return event.target || event.srcElement;
        },

        /**
         * @method octopus.event.isSingleTouch
         * @desc 判断是否单点
         * @param event {window.event}
         * @return {Boolean}
         */
        isSingleTouch: function(event) {
            return event.touches && event.touches.length == 1;
        },

        /**
         * @method octopus.event.isMultiTouch
         * @desc 判断是否多点
         * @param event {window.event}
         * @return {Boolean}
         */
        isMultiTouch: function(event) {
            return event.touches && event.touches.length > 1;
        },

        /**
         * @method octopus.event.isLeftClick
         * @desc 判断是否是左键点击
         * @param event {window.event}
         * @return {Boolean}
         */
        isLeftClick: function(event) {
            return !!(((event.which) && (event.which == 1)) ||
                ((event.button) && (event.button == 1)));
        },

        /**
         * @method octopus.event.isRightClick
         * @desc 判断是否右键点击
         * @param event {window.event}
         * @return {Boolean}
         */
        isRightClick: function(event) {
            return !!(((event.which) && (event.which == 3)) ||
                ((event.button) && (event.button == 2)));
        },

        /**
         * @method octopus.event.stop
         * @desc 把事件停了
         * @param event {window.event}
         * @param allowDefault {Boolean} -   是否把默认响应停了
         */
        stop: function(event, allowDefault) {
            if (!allowDefault) {
                if (event.preventDefault) {
                    event.preventDefault();
                } else {
                    event.returnValue = false;
                }
            }

            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
        },

        /**
         * @method octopus.event.findElement
         * @desc 找到触发事件的节点
         * @param event {window.event}
         * @return {DOMElement}
         */
        findElement: function(event) {
            var element = o.event.element(event);
            while (element.parentNode && (!element.tagName ||
                (element.tagName.toUpperCase() != tagName.toUpperCase()))){
                element = element.parentNode;
            }
            return element;
        },

        /**
         * @method octopus.event.on
         * @desc 监听事件
         * @param dom {String | DOMElement}
         * @param name {String}
         * @param fn {Function}
         * @param useCapture {Boolean}
         */
        on: function(dom, name, fn, useCapture) {
            var names = name.split(" "),
                len = names.length,
                i = len;
            if(len == 0)    return false;
            var element = o.g(dom),
                that = o.event;
            useCapture = useCapture || false;
            if(!that.observers) {
                that.observers = {};
            }
            if(!element._eventCacheID) {
                var idPrefix = "eventCacheID_";
                if (element.id) {
                    idPrefix = element.id + "_" + idPrefix;
                }
                element._eventCacheID = o.util.createUniqueID(idPrefix);
            }
            for(; i--; ) {
                that._on(element, names[i], fn, useCapture);
            }
            return element;
        },

        /**
         * @private
         * @method octopus.event._on
         * @desc 监听事件
         * @param el {DOMElement}
         * @param name {String}
         * @param fn {Function}
         * @param useCapture {Boolean}
         */
        _on: function(el, name, fn, useCapture) {
            if(name == "ortchange") {
                name = "orientationchange" in window ? "orientationchange" : "resize";
            }
            if(name == "ready") {
                name = "DOMContentLoaded";
            }

            var cacheID = el._eventCacheID,
                that = o.event;
            if(!that.observers[cacheID]) {
                that.observers[cacheID] = [];
            }
            that.observers[cacheID].push({
                'element': el,
                'name': name,
                'observer': fn,
                'useCapture': useCapture
            });
            if(el.addEventListener) {
                el.addEventListener(name, fn, useCapture);
            } else if (el.attachEvent) {
                el.attachEvent('on' + name, fn);
            }
        },

        /**
         * @method octopus.event.stopObservingElement
         * @desc 把指定节点的所有事件监听停掉
         * @param dom {DOMElement}
         */
        stopObservingElement: function(dom) {
            var element = o.g(dom);
            var cacheID = element._eventCacheID;
            this._removeElementObservers(o.event.observers[cacheID]);
        },

        /**
         * @method octopus.event.stopEventObserver
         * @param dom {DOMElement}
         * @param event {String} 指定停掉的事件类型
         * @desc 此方法会将指定节点上的指定方法的所有事件监听停掉 慎用
         */
        stopEventObserver: function(dom, event) {
            var cacheID = o.g(dom)._eventCacheID,
                that = o.event,
                elementObservers = that.observers[cacheID];
            if (elementObservers) {
                var i = elementObservers.length;
                for(; i--; ) {
                    var entry = elementObservers[i];
                    if(event == entry.name) {
                        var args = new Array(entry.element,
                            entry.name,
                            entry.observer,
                            entry.useCapture);
                        that.un.apply(this, args);
                    }
                }
            }
        },

        /**
         * @private
         * @method _removeElementObservers
         * @desc具体做事情的方法
         * @param elementObservers {Array} 一堆事件缓存对象
         */
        _removeElementObservers: function(elementObservers) {
            if (elementObservers) {
                var i =  elementObservers.length;
                for( ; i--; ) {
                    var entry = elementObservers[i];
                    var args = new Array(entry.element,
                        entry.name,
                        entry.observer,
                        entry.useCapture);
                    o.event.un.apply(this, args);
                }
            }
        },

        /**
         * @method octopus.event.un
         * @desc 单删一个指定事件监听
         * @param dom {String | DOMElement}
         * @param name {String}
         * @param fn {Function}
         * @param useCapture {Boolean}
         * @return {Boolean} 返回解除监听是否成功
         */
        un: function(dom, name, fn, useCapture) {
            var names = name.split(" "),
                len = names.length,
                i = len;
            if(len == 0)    return false;
            var element = o.g(dom),
                cacheID = element._eventCacheID,
                foundEntry = false;
            useCapture = useCapture || false;
            for(; i--; ) {
                foundEntry = o.event._un(element, names[i], fn, useCapture, cacheID);
            }
            return foundEntry;
        },

        /**
         * @private
         * @method octopus.event.un
         * @desc 单删一个指定事件监听
         * @param el {DOMElement}
         * @param name {String}
         * @param fn {Function}
         * @param useCapture {Boolean}
         * @param id {String}
         * @return {Boolean} 返回解除监听是否成功
         */
        _un: function(el, name, fn, useCapture, id) {
            if(name == "ortchange") {
                name = "orientationchange" in window ? "orientationchange" : "resize";
            }
            if(name == "ready") {
                name = "DOMContentLoaded";
            }
            if(name == 'keypress') {
                if ( navigator.appVersion.match(/Konqueror|Safari|KHTML/) ||
                    el.detachEvent) {
                    name = 'keydown';
                }
            }
            var foundEntry = false,
                elementObservers = o.event.observers[id];
            if (elementObservers) {
                var i=0;
                while(!foundEntry && i < elementObservers.length) {
                    var cacheEntry = elementObservers[i];
                    if ((cacheEntry.name == name) &&
                        (cacheEntry.observer == fn) &&
                        (cacheEntry.useCapture == useCapture)) {
                        elementObservers.splice(i, 1);
                        if (elementObservers.length == 0) {
                            o.event.observers[id] = null;
                        }
                        foundEntry = true;
                        break;
                    }
                    i++;
                }
            }
            if (foundEntry) {
                if (el.removeEventListener) {
                    el.removeEventListener(name, fn, useCapture);
                } else if (el && el.detachEvent) {
                    el.detachEvent('on' + name, fn);
                }
            }
            return foundEntry;
        },

        /**
         * @property unloadCache
         * @desc 页面销毁的时候希望可以释放掉所有监听
         */
        unloadCache: function() {
            if (o.event && o.event.observers) {
                for (var cacheID in o.event.observers) {
                    var elementObservers = o.event.observers[cacheID];
                    o.event._removeElementObservers.apply(this,
                        [elementObservers]);
                }
                o.event.observers = false;
            }
        }
    };

    o.event.on(window, "unload", o.event.unloadCache, false);

    /**
     * @class octopus.Events
     * @desc 自定义事件类
     * @param object {Object} 观察订阅事件的对象 必需
     * @param element {DOMElement} 一个响应浏览器事件的dom 非必需 如果指定了此值 则表示要对该节点进行一次惨绝人寰的封装
     * @param fallThrough {Boolean}
     * @param options {Object}
     */
    o.Events = o.define({

        /**
         * @private
         * @constant octopus.Events.BROWSER_EVENTS
         * @desc 常规的浏览器事件
         */
        BROWSER_EVENTS: [
            "mouseover", "mouseout", "mousedown", "mouseup", "mousemove",
            "click", "dblclick", "rightclick", "dblrightclick",
            "resize",
            "focus", "blur",
            "touchstart", "touchmove", "touchend",
            "keydown"
        ],

        /**
         * @private
         * @property listeners
         * @type {object}
         * @desc 事件监听的hash表
         */
        listeners: null,

        /**
         * @private
         * @property obj
         * @type {object}
         * @desc 事件对象所属的主体
         */
        obj: null,

        /**
         * @private
         * @property el
         * @type {DOMELement}
         * @desc 事件绑定的节点
         */
        el: null,

        /**
         * @private
         * @property eventHandler
         * @desc 绑定在节点上的触发函数
         * @type {Function}
         */
        eventHandler: null,

        /**
         * @private
         * @property fallThrough
         * @desc 事件是否允许传播
         * @type {Boolean}
         */
        fallThrough: false,

        /**
         * @private
         * @property extensions
         * @type {Object}
         * @desc 所有被注册的新的自定义事件需要这个实例
         * 自定义事件是指以Oupeng.Events.*开头的自定义事件
         * key为自定义事件名如tap value为自定义事件如Oupeng.Events.Tap 只是举个例子不用太认真
         */
        extensions: null,

        /**
         * @private
         * @property extensionCount
         * @type {Object}
         * @desc key是自定义事件的key value是handler的个数
         */
        extensionCount: null,

        /**
         * @private
         * @constructos: octopus.Events.initialize
         * @param obj {Object} 观察订阅事件的对象 必需
         * @param el {DOMElement} 一个响应浏览器事件的dom 非必需 如果指定了此值 则表示要对该节点进行一次惨绝人寰的封装
         * @param fallThrough {Boolean}
         * @param options {Object}
         */
        initialize: function(obj, el, fallThrough, options) {
            o.extend(this, options);
            this.obj = obj;
            this.fallThrough = fallThrough;
            this.listeners = {};
            this.extensions = {};
            this.extensionCount = {};
            if (el != null) {
                this.attachToElement(el);
            }
        },

        /**
         * @method octopus.Events.destroy
         * @public
         * @desc 创建的事件对象自我解脱
         */
        destroy: function () {
            for (var e in this.extensions) {
                if (typeof this.extensions[e] !== "boolean") {
                    this.extensions[e].destroy();
                }
            }
            this.extensions = null;
            if (this.el) {
                o.event.stopObservingElement(this.el);
            }
            this.el = null;
            this.listeners = null;
            this.obj = null;
            this.fallThrough = null;
            this.eventHandler = null;
        },

        /**
         * @private
         * @method attachToElement
         * @param el {DOMElement}
         */
        attachToElement: function(el) {
            if (this.el) {
                o.event.stopObservingElement(this.el);
            } else {
                this.eventHandler = o.util.bindAsEventListener(
                    this.handleBrowserEvent, this
                );
            }
            this.el = el;
            var i = 0,
                len = this.BROWSER_EVENTS.length;
            for (; i < len; i++) {
                o.event.on(el, this.BROWSER_EVENTS[i], this.eventHandler);
            }
            // 不去掉ie下会2掉
            o.event.on(el, "dragstart", o.event.stop);
        },

        /**
         * @private
         * @method handleBrowserEvent
         * @desc 在指定dom节点的情况下 封装该dom触发的event属性
         */
        handleBrowserEvent: function(evt) {
            var type = evt.type,
                listeners = this.listeners[type];
            if(!listeners || listeners.length == 0) return;
            var touches = evt.touches;
            if (touches && touches[0]) {
                var x = 0,
                    y = 0,
                    num = touches.length,
                    touch,
                    i = 0;
                for (; i < num; ++i) {
                    touch = touches[i];
                    x += touch.clientX;
                    y += touch.clientY;
                }
                evt.clientX = x / num;
                evt.clientY = y / num;
            }
            this.triggerEvent(type, evt);
        },

        /**
         * @method octopus.Events.on
         * @public
         * @desc 添加自定义事件监听
         * @param type {String} 事件类型
         * @param func {Function} 回调
         * @param obj {Object} 事件绑定的对象 默认为this.object
         * @param priority {Boolean | Object} 为true时 将增加的回调扔在触发回调队列的队头 可以理解为伪同步
         */
        on: function(type, func, obj, priority) {
            if (type in o.Events && !this.extensions[type]) {
                this.extensions[type] = new o.Events[type](this);
            }
            if (func != null) {
                if (obj == null || obj == undefined)  {
                    obj = this.obj;
                }
                var listeners = this.listeners[type];
                if (!listeners) {
                    listeners = [];
                    this.listeners[type] = listeners;
                    this.extensionCount[type] = 0;
                }
                var listener = {obj: obj, func: func};
                if (priority) {
                    listeners.splice(this.extensionCount[type], 0, listener);
                    if (typeof priority === "object" && priority.extension) {
                        this.extensionCount[type]++;
                    }
                } else {
                    listeners.push(listener);
                }
            }
        },

        /**
         * @method octopus.Events.un
         * @public
         * @desc 取消自定义事件的监听
         * @param type {String} 事件类型
         * @param func {Function} 触发回调
         * @param obj {Object} 默认自身
         */
        un: function(type, func, obj) {
            if (obj == null)  {
                obj = this.obj;
            }
            var listeners = this.listeners[type];
            if (listeners != null) {
                for (var i=0, len=listeners.length; i<len; i++) {
                    if (listeners[i].obj == obj && listeners[i].func == func) {
                        listeners.splice(i, 1);
                        break;
                    }
                }
            }
        },

        /**
         * @method octopus.Events.triggerEvent
         * @desc 触发事件
         * @param type {String} 触发事件类型
         * @param evt {event}
         */
        triggerEvent: function(type, evt) {
            var listeners = this.listeners[type];
            if(!listeners || listeners.length == 0) return undefined;
            if (evt == null) {
                evt = {};
            }
            evt.obj = this.obj;
            evt.el = this.el;
            if(!evt.type) {
                evt.type = type;
            }
            //clone一份
            listeners = listeners.slice();
            var continueChain,
                i = 0,
                len = listeners.length;
            for (; i < len; i++) {
                var callback = listeners[i];
                // bind the context to callback.obj
                continueChain = callback.func.apply(callback.obj, [evt]);
                if (continueChain === false) {
                    // 如果返回值为false表示回调到此为止
                    break;
                }
            }
            if (!this.fallThrough) {
                o.event.stop(evt, true);
            }
            return continueChain;
        },

        /**
         * @method octopus.Events.remove
         * @public
         * @desc 直接把指定事件类型的监听回调置空
         * @param type {String}
         */
        remove: function(type) {
            if (this.listeners[type] != null) {
                this.listeners[type] = [];
            }
        },

        /**
         * @method octopus.Events.register
         * @desc 批量增加事件
         * @param evs {Object}
         */
        register: function(evs) {
            for(var type in evs) {
                if(type != "scope" && evs.hasOwnProperty(type)) {
                    this.on(type, evs[type], evs.scope, false);
                }
            }
        },

        /**
         * @method octopus.Events.unregister
         * @desc 批量去除事件
         * @param evs {Object}
         */
        unregister: function(evs) {
            for(var type in evs) {
                if(type != "scope" && evs.hasOwnProperty(type)) {
                    this.un(type, evs[type], evs.scope);
                }
            }
        },

        CLASS_NAME: "Octopus.Events"
    });
})(octopus);/**
 * 直接引用hammer
 */

;(function(o, undefined) {
    'use strict';

    var Hammer = function(element, options) {
        return new Hammer.Instance(element, options || {});
    };

    Hammer.defaults = {
        // add styles and attributes to the element to prevent the browser from doing
        // its native behavior. this doesnt prevent the scrolling, but cancels
        // the contextmenu, tap highlighting etc
        // set to false to disable this
        stop_browser_behavior: {
            // this also triggers onselectstart=false for IE
            userSelect: 'none',
            // this makes the element blocking in IE10 >, you could experiment with the value
            // see for more options this issue; https://github.com/EightMedia/hammer.js/issues/241
            touchAction: 'none',
            touchCallout: 'none',
            contentZooming: 'none',
            userDrag: 'none',
            tapHighlightColor: 'rgba(0,0,0,0)'
        }

        // more settings are defined per gesture at gestures.js
    };

// detect touchevents
    Hammer.HAS_POINTEREVENTS = navigator.pointerEnabled || navigator.msPointerEnabled;
    Hammer.HAS_TOUCHEVENTS = ('ontouchstart' in window);

// dont use mouseevents on mobile devices
    Hammer.MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;
    Hammer.NO_MOUSEEVENTS = Hammer.HAS_TOUCHEVENTS && navigator.userAgent.match(Hammer.MOBILE_REGEX);

// eventtypes per touchevent (start, move, end)
// are filled by Hammer.event.determineEventTypes on setup
    Hammer.EVENT_TYPES = {};

// direction defines
    Hammer.DIRECTION_DOWN = 'down';
    Hammer.DIRECTION_LEFT = 'left';
    Hammer.DIRECTION_UP = 'up';
    Hammer.DIRECTION_RIGHT = 'right';

// pointer type
    Hammer.POINTER_MOUSE = 'mouse';
    Hammer.POINTER_TOUCH = 'touch';
    Hammer.POINTER_PEN = 'pen';

// touch event defines
    Hammer.EVENT_START = 'start';
    Hammer.EVENT_MOVE = 'move';
    Hammer.EVENT_END = 'end';

// hammer document where the base events are added at
    Hammer.DOCUMENT = document;

// plugins namespace
    Hammer.plugins = {};

// if the window events are set...
    Hammer.READY = false;

    /**
     * setup events to detect gestures on the document
     */
    function setup() {
        if(Hammer.READY) {
            return;
        }

        // find what eventtypes we add listeners to
        Hammer.event.determineEventTypes();

        // Register all gestures inside Hammer.gestures
        for(var name in Hammer.gestures) {
            if(Hammer.gestures.hasOwnProperty(name)) {
                Hammer.detection.register(Hammer.gestures[name]);
            }
        }

        // Add touch events on the document
        Hammer.event.onTouch(Hammer.DOCUMENT, Hammer.EVENT_MOVE, Hammer.detection.detect);
        Hammer.event.onTouch(Hammer.DOCUMENT, Hammer.EVENT_END, Hammer.detection.detect);

        // Hammer is ready...!
        Hammer.READY = true;
    }

    Hammer.Instance = function(element, options) {
        var self = this;

        // setup HammerJS window events and register all gestures
        // this also sets up the default options
        setup();

        this.element = element;

        // start/stop detection option
        this.enabled = true;

        // merge options
        this.options = Hammer.utils.extend(
            Hammer.utils.extend({}, Hammer.defaults),
            options || {});

        // add some css to the element to prevent the browser from doing its native behavoir
        if(this.options.stop_browser_behavior) {
            Hammer.utils.stopDefaultBrowserBehavior(this.element, this.options.stop_browser_behavior);
        }

        // start detection on touchstart
        Hammer.event.onTouch(element, Hammer.EVENT_START, function(ev) {
            if(self.enabled) {
                Hammer.detection.startDetect(self, ev);
            }
        });

        // return instance
        return this;
    };


    Hammer.Instance.prototype = {
        /**
         * bind events to the instance
         * @param   {String}      gesture
         * @param   {Function}    handler
         * @returns {Hammer.Instance}
         */
        on: function onEvent(gesture, handler){
            var gestures = gesture.split(' ');
            for(var t=0; t<gestures.length; t++) {
                this.element.addEventListener(gestures[t], handler, false);
            }
            return this;
        },


        /**
         * unbind events to the instance
         * @param   {String}      gesture
         * @param   {Function}    handler
         * @returns {Hammer.Instance}
         */
        off: function offEvent(gesture, handler){
            var gestures = gesture.split(' ');
            for(var t=0; t<gestures.length; t++) {
                this.element.removeEventListener(gestures[t], handler, false);
            }
            return this;
        },


        /**
         * trigger gesture event
         * @param   {String}      gesture
         * @param   {Object}      eventData
         * @returns {Hammer.Instance}
         */
        trigger: function triggerEvent(gesture, eventData){
            // create DOM event
            var event = Hammer.DOCUMENT.createEvent('Event');
            event.initEvent(gesture, true, true);
            event.gesture = eventData;

            // trigger on the target if it is in the instance element,
            // this is for event delegation tricks
            var element = this.element;
            if(Hammer.utils.hasParent(eventData.target, element)) {
                element = eventData.target;
            }

            element.dispatchEvent(event);
            return this;
        },


        /**
         * enable of disable hammer.js detection
         * @param   {Boolean}   state
         * @returns {Hammer.Instance}
         */
        enable: function enable(state) {
            this.enabled = state;
            return this;
        }
    };

    /**
     * this holds the last move event,
     * used to fix empty touchend issue
     * see the onTouch event for an explanation
     * @type {Object}
     */
    var last_move_event = null;


    /**
     * when the mouse is hold down, this is true
     * @type {Boolean}
     */
    var enable_detect = false;


    /**
     * when touch events have been fired, this is true
     * @type {Boolean}
     */
    var touch_triggered = false;


    Hammer.event = {
        /**
         * simple addEventListener
         * @param   {HTMLElement}   element
         * @param   {String}        type
         * @param   {Function}      handler
         */
        bindDom: function(element, type, handler) {
            var types = type.split(' ');
            for(var t=0; t<types.length; t++) {
                element.addEventListener(types[t], handler, false);
            }
        },


        /**
         * touch events with mouse fallback
         * @param   {HTMLElement}   element
         * @param   {String}        eventType        like Hammer.EVENT_MOVE
         * @param   {Function}      handler
         */
        onTouch: function onTouch(element, eventType, handler) {
            var self = this;

            this.bindDom(element, Hammer.EVENT_TYPES[eventType], function bindDomOnTouch(ev) {
                var sourceEventType = ev.type.toLowerCase();

                // onmouseup, but when touchend has been fired we do nothing.
                // this is for touchdevices which also fire a mouseup on touchend
                if(sourceEventType.match(/mouse/) && touch_triggered) {
                    return;
                }

                // mousebutton must be down or a touch event
                else if( sourceEventType.match(/touch/) ||   // touch events are always on screen
                    sourceEventType.match(/pointerdown/) || // pointerevents touch
                    (sourceEventType.match(/mouse/) && ev.which === 1)   // mouse is pressed
                    ){
                    enable_detect = true;
                }

                // we are in a touch event, set the touch triggered bool to true,
                // this for the conflicts that may occur on ios and android
                if(sourceEventType.match(/touch|pointer/)) {
                    touch_triggered = true;
                }

                // count the total touches on the screen
                var count_touches = 0;

                // when touch has been triggered in this detection session
                // and we are now handling a mouse event, we stop that to prevent conflicts
                if(enable_detect) {
                    // update pointerevent
                    if(Hammer.HAS_POINTEREVENTS && eventType != Hammer.EVENT_END) {
                        count_touches = Hammer.PointerEvent.updatePointer(eventType, ev);
                    }
                    // touch
                    else if(sourceEventType.match(/touch/)) {
                        count_touches = ev.touches.length;
                    }
                    // mouse
                    else if(!touch_triggered) {
                        count_touches = sourceEventType.match(/up/) ? 0 : 1;
                    }

                    // if we are in a end event, but when we remove one touch and
                    // we still have enough, set eventType to move
                    if(count_touches > 0 && eventType == Hammer.EVENT_END) {
                        eventType = Hammer.EVENT_MOVE;
                    }
                    // no touches, force the end event
                    else if(!count_touches) {
                        eventType = Hammer.EVENT_END;
                    }

                    // because touchend has no touches, and we often want to use these in our gestures,
                    // we send the last move event as our eventData in touchend
                    if(!count_touches && last_move_event !== null) {
                        ev = last_move_event;
                    }
                    // store the last move event
                    else {
                        last_move_event = ev;
                    }

                    // trigger the handler
                    handler.call(Hammer.detection, self.collectEventData(element, eventType, ev));

                    // remove pointerevent from list
                    if(Hammer.HAS_POINTEREVENTS && eventType == Hammer.EVENT_END) {
                        count_touches = Hammer.PointerEvent.updatePointer(eventType, ev);
                    }
                }

                //debug(sourceEventType +" "+ eventType);

                // on the end we reset everything
                if(!count_touches) {
                    last_move_event = null;
                    enable_detect = false;
                    touch_triggered = false;
                    Hammer.PointerEvent.reset();
                }
            });
        },


        /**
         * we have different events for each device/browser
         * determine what we need and set them in the Hammer.EVENT_TYPES constant
         */
        determineEventTypes: function determineEventTypes() {
            // determine the eventtype we want to set
            var types;

            // pointerEvents magic
            if(Hammer.HAS_POINTEREVENTS) {
                types = Hammer.PointerEvent.getEvents();
            }
            // on Android, iOS, blackberry, windows mobile we dont want any mouseevents
            else if(Hammer.NO_MOUSEEVENTS) {
                types = [
                    'touchstart',
                    'touchmove',
                    'touchend touchcancel'];
            }
            // for non pointer events browsers and mixed browsers,
            // like chrome on windows8 touch laptop
            else {
                types = [
                    'touchstart mousedown',
                    'touchmove mousemove',
                    'touchend touchcancel mouseup'];
            }

            Hammer.EVENT_TYPES[Hammer.EVENT_START]  = types[0];
            Hammer.EVENT_TYPES[Hammer.EVENT_MOVE]   = types[1];
            Hammer.EVENT_TYPES[Hammer.EVENT_END]    = types[2];
        },


        /**
         * create touchlist depending on the event
         * @param   {Object}    ev
         * @param   {String}    eventType   used by the fakemultitouch plugin
         */
        getTouchList: function getTouchList(ev/*, eventType*/) {
            // get the fake pointerEvent touchlist
            if(Hammer.HAS_POINTEREVENTS) {
                return Hammer.PointerEvent.getTouchList();
            }
            // get the touchlist
            else if(ev.touches) {
                return ev.touches;
            }
            // make fake touchlist from mouse position
            else {
                return [{
                    identifier: 1,
                    pageX: ev.pageX,
                    pageY: ev.pageY,
                    target: ev.target
                }];
            }
        },


        /**
         * collect event data for Hammer js
         * @param   {HTMLElement}   element
         * @param   {String}        eventType        like Hammer.EVENT_MOVE
         * @param   {Object}        eventData
         */
        collectEventData: function collectEventData(element, eventType, ev) {
            var touches = this.getTouchList(ev, eventType);

            // find out pointerType
            var pointerType = Hammer.POINTER_TOUCH;
            if(ev.type.match(/mouse/) || Hammer.PointerEvent.matchType(Hammer.POINTER_MOUSE, ev)) {
                pointerType = Hammer.POINTER_MOUSE;
            }

            return {
                center      : o.util.getCenter(touches),
                timeStamp   : new Date().getTime(),
                target      : ev.target,
                touches     : touches,
                eventType   : eventType,
                pointerType : pointerType,
                srcEvent    : ev,


                preventDefault: function() {
                    if(this.srcEvent.preventManipulation) {
                        this.srcEvent.preventManipulation();
                    }

                    if(this.srcEvent.preventDefault) {
                        this.srcEvent.preventDefault();
                    }
                },

                stopPropagation: function() {
                    this.srcEvent.stopPropagation();
                },

                stopDetect: function() {
                    return Hammer.detection.stopDetect();
                }
            };
        }
    };

    Hammer.PointerEvent = {
        /**
         * holds all pointers
         * @type {Object}
         */
        pointers: {},

        /**
         * get a list of pointers
         * @returns {Array}     touchlist
         */
        getTouchList: function() {
            var self = this;
            var touchlist = [];

            // we can use forEach since pointerEvents only is in IE10
            Object.keys(self.pointers).sort().forEach(function(id) {
                touchlist.push(self.pointers[id]);
            });
            return touchlist;
        },

        /**
         * update the position of a pointer
         * @param   {String}   type             Hammer.EVENT_END
         * @param   {Object}   pointerEvent
         */
        updatePointer: function(type, pointerEvent) {
            if(type == Hammer.EVENT_END) {
                this.pointers = {};
            }
            else {
                pointerEvent.identifier = pointerEvent.pointerId;
                this.pointers[pointerEvent.pointerId] = pointerEvent;
            }

            return Object.keys(this.pointers).length;
        },

        /**
         * check if ev matches pointertype
         * @param   {String}        pointerType     Hammer.POINTER_MOUSE
         * @param   {PointerEvent}  ev
         */
        matchType: function(pointerType, ev) {
            if(!ev.pointerType) {
                return false;
            }

            var types = {};
            types[Hammer.POINTER_MOUSE] = (ev.pointerType == ev.MSPOINTER_TYPE_MOUSE || ev.pointerType == Hammer.POINTER_MOUSE);
            types[Hammer.POINTER_TOUCH] = (ev.pointerType == ev.MSPOINTER_TYPE_TOUCH || ev.pointerType == Hammer.POINTER_TOUCH);
            types[Hammer.POINTER_PEN] = (ev.pointerType == ev.MSPOINTER_TYPE_PEN || ev.pointerType == Hammer.POINTER_PEN);
            return types[pointerType];
        },


        /**
         * get events
         */
        getEvents: function() {
            return [
                'pointerdown MSPointerDown',
                'pointermove MSPointerMove',
                'pointerup pointercancel MSPointerUp MSPointerCancel'
            ];
        },

        /**
         * reset the list
         */
        reset: function() {
            this.pointers = {};
        }
    };


    Hammer.utils = {
        /**
         * extend method,
         * also used for cloning when dest is an empty object
         * @param   {Object}    dest
         * @param   {Object}    src
         * @parm	{Boolean}	merge		do a merge
         * @returns {Object}    dest
         */
        extend: function extend(dest, src, merge) {
            for (var key in src) {
                if(dest[key] !== undefined && merge) {
                    continue;
                }
                dest[key] = src[key];
            }
            return dest;
        },


        /**
         * find if a node is in the given parent
         * used for event delegation tricks
         * @param   {HTMLElement}   node
         * @param   {HTMLElement}   parent
         * @returns {boolean}       has_parent
         */
        hasParent: function(node, parent) {
            while(node){
                if(node == parent) {
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        },


        /**
         * boolean if the direction is vertical
         * @param    {String}    direction
         * @returns  {Boolean}   is_vertical
         */
        isVertical: function isVertical(direction) {
            return (direction == Hammer.DIRECTION_UP || direction == Hammer.DIRECTION_DOWN);
        },


        /**
         * stop browser default behavior with css props
         * @param   {HtmlElement}   element
         * @param   {Object}        css_props
         */
        stopDefaultBrowserBehavior: function stopDefaultBrowserBehavior(element, css_props) {
            var prop,
                vendors = ['webkit','khtml','moz','ms','o',''];

            if(!css_props || !element.style) {
                return;
            }

            // with css properties for modern browsers
            for(var i = 0; i < vendors.length; i++) {
                for(var p in css_props) {
                    if(css_props.hasOwnProperty(p)) {
                        prop = p;

                        // vender prefix at the property
                        if(vendors[i]) {
                            prop = vendors[i] + prop.substring(0, 1).toUpperCase() + prop.substring(1);
                        }

                        // set the style
                        element.style[prop] = css_props[p];
                    }
                }
            }

            // also the disable onselectstart
            if(css_props.userSelect == 'none') {
                element.onselectstart = function() {
                    return false;
                };
            }
        }
    };

    Hammer.detection = {
        // contains all registred Hammer.gestures in the correct order
        gestures: [],

        // data of the current Hammer.gesture detection session
        current: null,

        // the previous Hammer.gesture session data
        // is a full clone of the previous gesture.current object
        previous: null,

        // when this becomes true, no gestures are fired
        stopped: false,


        /**
         * start Hammer.gesture detection
         * @param   {Hammer.Instance}   inst
         * @param   {Object}            eventData
         */
        startDetect: function startDetect(inst, eventData) {
            // already busy with a Hammer.gesture detection on an element
            if(this.current) {
                return;
            }

            this.stopped = false;

            this.current = {
                inst        : inst, // reference to HammerInstance we're working for
                startEvent  : Hammer.utils.extend({}, eventData), // start eventData for distances, timing etc
                lastEvent   : false, // last eventData
                name        : '' // current gesture we're in/detected, can be 'tap', 'hold' etc
            };

            this.detect(eventData);
        },


        /**
         * Hammer.gesture detection
         * @param   {Object}    eventData
         * @param   {Object}    eventData
         */
        detect: function detect(eventData) {
            if(!this.current || this.stopped) {
                return;
            }

            // extend event data with calculations about scale, distance etc
            eventData = this.extendEventData(eventData);

            // instance options
            var inst_options = this.current.inst.options;

            // call Hammer.gesture handlers
            for(var g=0,len=this.gestures.length; g<len; g++) {
                var gesture = this.gestures[g];

                // only when the instance options have enabled this gesture
                if(!this.stopped && inst_options[gesture.name] !== false) {
                    // if a handler returns false, we stop with the detection
                    if(gesture.handler.call(gesture, eventData, this.current.inst) === false) {
                        this.stopDetect();
                        break;
                    }
                }
            }

            // store as previous event event
            if(this.current) {
                this.current.lastEvent = eventData;
            }

            // endevent, but not the last touch, so dont stop
            if(eventData.eventType == Hammer.EVENT_END && !eventData.touches.length-1) {
                this.stopDetect();
            }

            return eventData;
        },


        /**
         * clear the Hammer.gesture vars
         * this is called on endDetect, but can also be used when a final Hammer.gesture has been detected
         * to stop other Hammer.gestures from being fired
         */
        stopDetect: function stopDetect() {
            // clone current data to the store as the previous gesture
            // used for the double tap gesture, since this is an other gesture detect session
            this.previous = Hammer.utils.extend({}, this.current);

            // reset the current
            this.current = null;

            // stopped!
            this.stopped = true;
        },


        /**
         * extend eventData for Hammer.gestures
         * @param   {Object}   ev
         * @returns {Object}   ev
         */
        extendEventData: function extendEventData(ev) {
            var startEv = this.current.startEvent;

            // if the touches change, set the new touches over the startEvent touches
            // this because touchevents don't have all the touches on touchstart, or the
            // user must place his fingers at the EXACT same time on the screen, which is not realistic
            // but, sometimes it happens that both fingers are touching at the EXACT same time
            if(startEv && (ev.touches.length != startEv.touches.length || ev.touches === startEv.touches)) {
                // extend 1 level deep to get the touchlist with the touch objects
                startEv.touches = [];
                for(var i=0,len=ev.touches.length; i<len; i++) {
                    startEv.touches.push(Hammer.utils.extend({}, ev.touches[i]));
                }
            }

            var delta_time = ev.timeStamp - startEv.timeStamp,
                delta_x = ev.center.pageX - startEv.center.pageX,
                delta_y = ev.center.pageY - startEv.center.pageY,
                velocity = o.util.getVelocity(delta_time, delta_x, delta_y);

            Hammer.utils.extend(ev, {
                deltaTime   : delta_time,

                deltaX      : delta_x,
                deltaY      : delta_y,

                velocityX   : velocity.x,
                velocityY   : velocity.y,

                distance    : o.util.getDistance(startEv.center, ev.center),
                angle       : o.util.getAngle(startEv.center, ev.center),
                direction   : o.util.getDirection(startEv.center, ev.center),

                scale       : o.util.getScale(startEv.touches, ev.touches),
                rotation    : o.util.getRotation(startEv.touches, ev.touches),

                startEvent  : startEv
            });

            return ev;
        },


        /**
         * register new gesture
         * @param   {Object}    gesture object, see gestures.js for documentation
         * @returns {Array}     gestures
         */
        register: function register(gesture) {
            // add an enable gesture options if there is no given
            var options = gesture.defaults || {};
            if(options[gesture.name] === undefined) {
                options[gesture.name] = true;
            }

            // extend Hammer default options with the Hammer.gesture options
            Hammer.utils.extend(Hammer.defaults, options, true);

            // set its index
            gesture.index = gesture.index || 1000;

            // add Hammer.gesture to the list
            this.gestures.push(gesture);

            // sort the list by index
            this.gestures.sort(function(a, b) {
                if (a.index < b.index) {
                    return -1;
                }
                if (a.index > b.index) {
                    return 1;
                }
                return 0;
            });

            return this.gestures;
        }
    };


    Hammer.gestures = Hammer.gestures || {};

    /**
     * Custom gestures
     * ==============================
     *
     * Gesture object
     * --------------------
     * The object structure of a gesture:
     *
     * { name: 'mygesture',
 *   index: 1337,
 *   defaults: {
 *     mygesture_option: true
 *   }
 *   handler: function(type, ev, inst) {
 *     // trigger gesture event
 *     inst.trigger(this.name, ev);
 *   }
 * }

     * @param   {String}    name
     * this should be the name of the gesture, lowercase
     * it is also being used to disable/enable the gesture per instance config.
     *
     * @param   {Number}    [index=1000]
     * the index of the gesture, where it is going to be in the stack of gestures detection
     * like when you build an gesture that depends on the drag gesture, it is a good
     * idea to place it after the index of the drag gesture.
     *
     * @param   {Object}    [defaults={}]
     * the default settings of the gesture. these are added to the instance settings,
     * and can be overruled per instance. you can also add the name of the gesture,
     * but this is also added by default (and set to true).
     *
     * @param   {Function}  handler
     * this handles the gesture detection of your custom gesture and receives the
     * following arguments:
     *
     *      @param  {Object}    eventData
     *      event data containing the following properties:
     *          timeStamp   {Number}        time the event occurred
     *          target      {HTMLElement}   target element
     *          touches     {Array}         touches (fingers, pointers, mouse) on the screen
     *          pointerType {String}        kind of pointer that was used. matches Hammer.POINTER_MOUSE|TOUCH
     *          center      {Object}        center position of the touches. contains pageX and pageY
     *          deltaTime   {Number}        the total time of the touches in the screen
     *          deltaX      {Number}        the delta on x axis we haved moved
     *          deltaY      {Number}        the delta on y axis we haved moved
     *          velocityX   {Number}        the velocity on the x
     *          velocityY   {Number}        the velocity on y
     *          angle       {Number}        the angle we are moving
     *          direction   {String}        the direction we are moving. matches Hammer.DIRECTION_UP|DOWN|LEFT|RIGHT
     *          distance    {Number}        the distance we haved moved
     *          scale       {Number}        scaling of the touches, needs 2 touches
     *          rotation    {Number}        rotation of the touches, needs 2 touches *
     *          eventType   {String}        matches Hammer.EVENT_START|MOVE|END
     *          srcEvent    {Object}        the source event, like TouchStart or MouseDown *
     *          startEvent  {Object}        contains the same properties as above,
     *                                      but from the first touch. this is used to calculate
     *                                      distances, deltaTime, scaling etc
     *
     *      @param  {Hammer.Instance}    inst
     *      the instance we are doing the detection for. you can get the options from
     *      the inst.options object and trigger the gesture event by calling inst.trigger
     *
     *
     * Handle gestures
     * --------------------
     * inside the handler you can get/set Hammer.detection.current. This is the current
     * detection session. It has the following properties
     *      @param  {String}    name
     *      contains the name of the gesture we have detected. it has not a real function,
     *      only to check in other gestures if something is detected.
     *      like in the drag gesture we set it to 'drag' and in the swipe gesture we can
     *      check if the current gesture is 'drag' by accessing Hammer.detection.current.name
     *
     *      @readonly
     *      @param  {Hammer.Instance}    inst
     *      the instance we do the detection for
     *
     *      @readonly
     *      @param  {Object}    startEvent
     *      contains the properties of the first gesture detection in this session.
     *      Used for calculations about timing, distance, etc.
     *
     *      @readonly
     *      @param  {Object}    lastEvent
     *      contains all the properties of the last gesture detect in this session.
     *
     * after the gesture detection session has been completed (user has released the screen)
     * the Hammer.detection.current object is copied into Hammer.detection.previous,
     * this is usefull for gestures like doubletap, where you need to know if the
     * previous gesture was a tap
     *
     * options that have been set by the instance can be received by calling inst.options
     *
     * You can trigger a gesture event by calling inst.trigger("mygesture", event).
     * The first param is the name of your gesture, the second the event argument
     *
     *
     * Register gestures
     * --------------------
     * When an gesture is added to the Hammer.gestures object, it is auto registered
     * at the setup of the first Hammer instance. You can also call Hammer.detection.register
     * manually and pass your gesture object as a param
     *
     */

    /**
     * LonTap
     * Touch stays at the same place for x time
     * @events  lontap
     */
    Hammer.gestures.LonTap = {
        name: 'lontap',
        index: 10,
        defaults: {
            hold_timeout	: 500,
            hold_threshold	: 1
        },
        timer: null,
        handler: function holdGesture(ev, inst) {
            switch(ev.eventType) {
                case Hammer.EVENT_START:
                    // clear any running timers
                    clearTimeout(this.timer);

                    // set the gesture so we can check in the timeout if it still is
                    Hammer.detection.current.name = this.name;

                    // set timer and if after the timeout it still is lontap,
                    // we trigger the lontap event
                    this.timer = setTimeout(function() {
                        if(Hammer.detection.current.name == 'lontap') {
                            inst.trigger('lontap', ev);
                        }
                    }, inst.options.hold_timeout);
                    break;

                // when you move or end we clear the timer
                case Hammer.EVENT_MOVE:
                    if(ev.distance > inst.options.hold_threshold) {
                        clearTimeout(this.timer);
                    }
                    break;

                case Hammer.EVENT_END:
                    clearTimeout(this.timer);
                    break;
            }
        }
    };


    /**
     * Tap/DoubleTap
     * Quick touch at a place or double at the same place
     * @events  tap, doubletap
     */
    Hammer.gestures.Tap = {
        name: 'tap',
        index: 100,
        defaults: {
            tap_max_touchtime	: 250,
            tap_max_distance	: 10,
            tap_always			: true,
            doubletap_distance	: 20,
            doubletap_interval	: 300
        },
        handler: function tapGesture(ev, inst) {
            if(ev.eventType == Hammer.EVENT_END) {
                // previous gesture, for the double tap since these are two different gesture detections
                var prev = Hammer.detection.previous,
                    did_doubletap = false;
                // when the touchtime is higher then the max touch time
                // or when the moving distance is too much
                if(ev.deltaTime > inst.options.tap_max_touchtime ||
                    ev.distance > inst.options.tap_max_distance) {
                    return;
                }
                // check if double tap
                if(prev && prev.name == 'tap' &&
                    (ev.timeStamp - prev.lastEvent.timeStamp) < inst.options.doubletap_interval &&
                    ev.distance < inst.options.doubletap_distance) {
                    inst.trigger('doubletap', ev);
                    did_doubletap = true;
                }

                // do a single tap
                if(!did_doubletap || inst.options.tap_always) {
                    Hammer.detection.current.name = 'tap';
                    inst.trigger(Hammer.detection.current.name, ev);
                }
            }
        }
    };


    /**
     * Swipe
     * triggers swipe events when the end velocity is above the threshold
     * @events  swipe, swipeleft, swiperight, swipeup, swipedown
     */
    Hammer.gestures.Swipe = {
        name: 'swipe',
        index: 40,
        defaults: {
            // set 0 for unlimited, but this can conflict with transform
            swipe_max_touches  : 1,
            swipe_velocity     : 0.7
        },
        handler: function swipeGesture(ev, inst) {
            if(ev.eventType == Hammer.EVENT_END) {
                // max touches
                if(inst.options.swipe_max_touches > 0 &&
                    ev.touches.length > inst.options.swipe_max_touches) {
                    return;
                }

                // when the distance we moved is too small we skip this gesture
                // or we can be already in dragging
                if(ev.velocityX > inst.options.swipe_velocity ||
                    ev.velocityY > inst.options.swipe_velocity) {
                    // trigger swipe events
                    inst.trigger(this.name, ev);
                    inst.trigger(this.name + ev.direction, ev);
                }
            }
        }
    };


    /**
     * Drag
     * Move with x fingers (default 1) around on the page. Blocking the scrolling when
     * moving left and right is a good practice. When all the drag events are blocking
     * you disable scrolling on that area.
     * @events  drag, drapleft, dragright, dragup, dragdown
     */
    Hammer.gestures.Drag = {
        name: 'drag',
        index: 50,
        defaults: {
            drag_min_distance : 10,
            // set 0 for unlimited, but this can conflict with transform
            drag_max_touches  : 1,
            // prevent default browser behavior when dragging occurs
            // be careful with it, it makes the element a blocking element
            // when you are using the drag gesture, it is a good practice to set this true
            drag_block_horizontal   : false,
            drag_block_vertical     : false,
            // drag_lock_to_axis keeps the drag gesture on the axis that it started on,
            // It disallows vertical directions if the initial direction was horizontal, and vice versa.
            drag_lock_to_axis       : false,
            // drag lock only kicks in when distance > drag_lock_min_distance
            // This way, locking occurs only when the distance has become large enough to reliably determine the direction
            drag_lock_min_distance : 25
        },
        triggered: false,
        handler: function dragGesture(ev, inst) {
            // current gesture isnt drag, but dragged is true
            // this means an other gesture is busy. now call dragend
            if(Hammer.detection.current.name != this.name && this.triggered) {
                inst.trigger(this.name +'end', ev);
                this.triggered = false;
                return;
            }

            // max touches
            if(inst.options.drag_max_touches > 0 &&
                ev.touches.length > inst.options.drag_max_touches) {
                return;
            }

            switch(ev.eventType) {
                case Hammer.EVENT_START:
                    this.triggered = false;
                    break;

                case Hammer.EVENT_MOVE:
                    // when the distance we moved is too small we skip this gesture
                    // or we can be already in dragging
                    if(ev.distance < inst.options.drag_min_distance &&
                        Hammer.detection.current.name != this.name) {
                        return;
                    }

                    // we are dragging!
                    Hammer.detection.current.name = this.name;

                    // lock drag to axis?
                    if(Hammer.detection.current.lastEvent.drag_locked_to_axis || (inst.options.drag_lock_to_axis && inst.options.drag_lock_min_distance<=ev.distance)) {
                        ev.drag_locked_to_axis = true;
                    }
                    var last_direction = Hammer.detection.current.lastEvent.direction;
                    if(ev.drag_locked_to_axis && last_direction !== ev.direction) {
                        // keep direction on the axis that the drag gesture started on
                        if(Hammer.utils.isVertical(last_direction)) {
                            ev.direction = (ev.deltaY < 0) ? Hammer.DIRECTION_UP : Hammer.DIRECTION_DOWN;
                        }
                        else {
                            ev.direction = (ev.deltaX < 0) ? Hammer.DIRECTION_LEFT : Hammer.DIRECTION_RIGHT;
                        }
                    }

                    // first time, trigger dragstart event
                    if(!this.triggered) {
                        inst.trigger(this.name +'start', ev);
                        this.triggered = true;
                    }

                    // trigger normal event
                    inst.trigger(this.name, ev);

                    // direction event, like dragdown
                    inst.trigger(this.name + ev.direction, ev);

                    // block the browser events
                    if( (inst.options.drag_block_vertical && Hammer.utils.isVertical(ev.direction)) ||
                        (inst.options.drag_block_horizontal && !Hammer.utils.isVertical(ev.direction))) {
                        ev.preventDefault();
                    }
                    break;

                case Hammer.EVENT_END:
                    // trigger dragend
                    if(this.triggered) {
                        inst.trigger(this.name +'end', ev);
                    }

                    this.triggered = false;
                    break;
            }
        }
    };


    /**
     * Transform
     * User want to scale or rotate with 2 fingers
     * @events  transform, pinch, pinchin, pinchout, rotate
     */
    Hammer.gestures.Transform = {
        name: 'transform',
        index: 45,
        defaults: {
            // factor, no scale is 1, zoomin is to 0 and zoomout until higher then 1
            transform_min_scale     : 0.01,
            // rotation in degrees
            transform_min_rotation  : 1,
            // prevent default browser behavior when two touches are on the screen
            // but it makes the element a blocking element
            // when you are using the transform gesture, it is a good practice to set this true
            transform_always_block  : false
        },
        triggered: false,
        handler: function transformGesture(ev, inst) {
            // current gesture isnt drag, but dragged is true
            // this means an other gesture is busy. now call dragend
            if(Hammer.detection.current.name != this.name && this.triggered) {
                inst.trigger(this.name +'end', ev);
                this.triggered = false;
                return;
            }

            // atleast multitouch
            if(ev.touches.length < 2) {
                return;
            }

            // prevent default when two fingers are on the screen
            if(inst.options.transform_always_block) {
                ev.preventDefault();
            }

            switch(ev.eventType) {
                case Hammer.EVENT_START:
                    this.triggered = false;
                    break;

                case Hammer.EVENT_MOVE:
                    var scale_threshold = Math.abs(1-ev.scale);
                    var rotation_threshold = Math.abs(ev.rotation);

                    // when the distance we moved is too small we skip this gesture
                    // or we can be already in dragging
                    if(scale_threshold < inst.options.transform_min_scale &&
                        rotation_threshold < inst.options.transform_min_rotation) {
                        return;
                    }

                    // we are transforming!
                    Hammer.detection.current.name = this.name;

                    // first time, trigger dragstart event
                    if(!this.triggered) {
                        inst.trigger(this.name +'start', ev);
                        this.triggered = true;
                    }

                    inst.trigger(this.name, ev); // basic transform event

                    // trigger rotate event
                    if(rotation_threshold > inst.options.transform_min_rotation) {
                        inst.trigger('rotate', ev);
                    }

                    // trigger pinch event
                    if(scale_threshold > inst.options.transform_min_scale) {
                        inst.trigger('pinch', ev);
                        inst.trigger('pinch'+ ((ev.scale < 1) ? 'in' : 'out'), ev);
                    }
                    break;

                case Hammer.EVENT_END:
                    // trigger dragend
                    if(this.triggered) {
                        inst.trigger(this.name +'end', ev);
                    }

                    this.triggered = false;
                    break;
            }
        }
    };


    /**
     * Touch
     * Called as first, tells the user has touched the screen
     * @events  touch
     */
    Hammer.gestures.Touch = {
        name: 'touch',
        index: -Infinity,
        defaults: {
            // call preventDefault at touchstart, and makes the element blocking by
            // disabling the scrolling of the page, but it improves gestures like
            // transforming and dragging.
            // be careful with using this, it can be very annoying for users to be stuck
            // on the page
            prevent_default: false,

            // disable mouse events, so only touch (or pen!) input triggers events
            prevent_mouseevents: false
        },
        handler: function touchGesture(ev, inst) {
            if(inst.options.prevent_mouseevents && ev.pointerType == Hammer.POINTER_MOUSE) {
                ev.stopDetect();
                return;
            }

            if(inst.options.prevent_default) {
                ev.preventDefault();
            }

            if(ev.eventType ==  Hammer.POINTER_MOUSE) {
                inst.trigger(this.name, ev);
            }
        }
    };


    /**
     * Release
     * Called as last, tells the user has released the screen
     * @events  release
     */
    Hammer.gestures.Release = {
        name: 'release',
        index: Infinity,
        handler: function releaseGesture(ev, inst) {
            if(ev.eventType ==  Hammer.EVENT_END) {
                inst.trigger(this.name, ev);
            }
        }
    };

    o.gesture = Hammer;

})(octopus);
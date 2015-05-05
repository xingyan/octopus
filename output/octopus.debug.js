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
 * @file
 * webapp通用组件基础库文件
 * 模板引擎部分
 * @require lib/class.js
 * @require lib/util.js
 * @author oupeng-fe
 * @version 1.1
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @namespace octopus.template
     */
    o.template = o.template || {};

    o.extend(o.template, {

        /**
         * @private
         * @property caches
         * @type {Object}
         */
        caches: {},

        /**
         * @private
         * @method templateText
         * @param element
         */
        templateText: function(element) {
            if(!o.util.isNode(element)) return "";
            if(/^(input|textarea)$/i.test(element.tagName)) return element.value;
            return o.util.decodeHtml(element.innerHTML);
        },

        /**
         * @private
         * @method register
         * @param id {String}
         * @param target {DOMElement}
         */
        register: function(id, target) {
            if(!id) return;
            if(this.caches[id]) {
                return this.caches[id];
            }
            return this.caches[id] = this.parse(o.util.isString(target) ? target : this.templateText(o.g(target)));
        },

        /**
         * @private
         * @method parse
         * @param template {String}
         */
        parse: function(template) {
            var body = [];
            body.push("with(this){");
            body.push(template
                .replace(/[\r\n]+/g, "\n") // 去掉多余的换行，并且去掉IE中困扰人的\r
                .replace(/^\n+|\s+$/mg, "") // 去掉空行，首部空行，尾部空白
                .replace(/((^\s*[<>!#^&\u0000-\u0008\u007F-\uffff].*$|^.*[<>]\s*$|^(?!\s*(else|do|try|finally)\s*$)[^'":;,\[\]{}()\n\/]+$|^(\s*(([\w-]+\s*=\s*"[^"]*")|([\w-]+\s*=\s*'[^']*')))+\s*$|^\s*([.#][\w-.]+(:\w+)?(\s*|,))*(?!(else|do|while|try|return)\b)[.#]?[\w-.*]+(:\w+)?\s*\{.*$)\s?)+/mg, function(expression) { // 输出原文
                    expression = ['"', expression
                        .replace(/&none;/g, "") // 空字符
                        .replace(/["'\\]/g, "\\$&") // 处理转义符
                        .replace(/\n/g, "\\n") // 处理回车转义符
                        .replace(/(!?#)\{(.*?)\}/g, function (all, flag, template) { // 变量替换
                            template = template.replace(/\\n/g, "\n").replace(/\\([\\'"])/g, "$1"); // 还原转义
                            var identifier = /^[a-z$][\w+$]+$/i.test(template) &&
                                !(/^(true|false|NaN|null|this)$/.test(template)); // 单纯变量，加一个未定义保护
                            return ['",',
                                identifier ? ['typeof ', template, '=="undefined"?"":'].join("") : "",
                                (flag == "#" ? '_encode_' : ""),
                                '(', template, '),"'].join("");
                        }), '"'].join("").replace(/^"",|,""$/g, "");
                    if (expression)
                        return ['_output_.push(', expression, ');'].join("");
                    else return "";
                }));
            body.push("}");
            var result = new Function("_output_", "_encode_", "helper", body.join(""));
            return result;
        },

        /**
         * @public
         * @method octopus.template.format
         */
        format: function(id, data, helper) {
            if (!id) return "";
            var reader, element;
            if (o.util.isNode(id)) { // 如果是Dom对象
                element = id;
                id = element.getAttribute("id");
            }
            helper = helper || this;
            reader = this.caches[id];
            if(!reader) {
                if(!/[^\w-]/.test(id)) {
                    if(!element) {
                        element = o.g(id);
                    }
                    reader = this.register(id, element);
                } else {
                    reader = this.parse(id);
                }
            }
            var output = [];
            reader.call(data || "", output, o.util.encodeHtml, helper);
            return output.join("");
        }
    });
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
 * 动画部分
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/event.js
 * @author oupeng-fe
 * @version 1.1
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @class octopus.Tween
     * @desc 动画类，可以通过改变属性、起始值、结束值等配置让指定节点完成动态过渡
     * 注意：由于情况过于复杂 凡是改变属性是transform属性或包含transform属性的动画 只能按照css3的形式进行 默认动画类型是ease-out
     * @param el {DOMElement} 指定完成动画的节点
     * @param pro {String | Array} 待改变的属性 可为多值
     * @param startv {String | Number | Array} 起始值 如为数组 必须与改变属性一一对应 否则会抛错
     * @param endv {String | Number | Array} 结束值 具体要求同起始值
     * @param duration {Number} 动化过渡的时间 单位为秒/s
     * @param func {Function} 动画结束的回调函数
     * @param options {Object} 其他配置项 可为空 默认为js动画 动画类型为"octopus.easing."
     * @param options.ease {String | Object} 动画类 如果为字符串 则采用css3的transition动画 否则需要传入"octopus.easing.XXX"的动画对象
     * @example
     * var newtween = new Tween(el, ["width", "webkitTransform"], [64, "translate3d(0, 0, 0)"],
     *  [128, "translate3d(30px, 0, 0)"], .4, function() {
     *     console.log(Animation finished!);
     * }, {
     *     ease: "ease-out" | octopus.easing.linear.easeOut
     * });
     * @throw
     * @return {octopus.Tween}
     */
    o.Tween = o.define({

        /**
         * @private
         * @property el
         * {DOMElement}
         */
        el: null,

        /**
         * @private
         * @property propertyName
         * {String}
         */
        propertyName: null,

        /**
         * @private
         * @property startValue
         * {String}
         */
        startValue: null,

        /**
         * @private
         * @property endValue
         * {String}
         */
        endValue: null,

        /**
         * @private
         * @property duration
         * {Number}
         */
        duration: null,

        /**
         * @private
         * @property func
         * {Function}
         */
        func: null,

        /**
         * @private
         * @property ease
         * {Object}
         */
        ease: null,

        /**
         * @private
         * @property needParams
         * {Array}
         */
        needParams: null,

        /**
         * @private
         * @property paramsDics
         * {Array}
         */
        paramsDics: null,

        /**
         * @private
         * @property requestAnimation
         * {Object}
         */
        requestAnimation: null,

        /**
         * @private
         * @property colorList
         * {Array}
         */
        colorList: null,

        /**
         * @private
         * @property stopRequest
         * {Boolean}
         */
        stopRequest: true,

        /**
         * @private
         * @property vector
         * {Object}
         */
        vector: null,

        /**
         * @private
         * @property prefix
         * {String}
         */
        prefix: null,

        /**
         * @private
         * @property eventPrefix
         * {String}
         */
        eventPrefix: null,

        /**
         * @private
         * @property isOffCss
         * {Boolean}
         */
        isOffCss: false,

        /**
         * @private
         * @property endEvent
         * {String}
         */
        endEvent: null,

        /**
         * @private
         * @property isTransform
         * @type {Boolean}
         */
        isTransform: false,

        /**
         * @private
         * @property eventTimer
         * @type {Number}
         */
        eventTimer: null,

        /**
         * @private
         * @property delay
         * @type {Number}
         */
        delay: null,

        /**
         * @private
         * @constructor octopus.Tween
         */
        initialize: function(el, pro, startv, endv, duration, func, options) {
            if(!o.util.isNode(el))    throw new Error("require a node!");
            o.extend(this, options);
            this.el = el;
            this.propertyName = pro;
            this.startValue = startv;
            this.endValue = endv;
            this.duration = duration;
            this.func = func || o.util.empty;
            this.needParams = [];
            this.colorList = [];
            this.paramsDics = ["width", "height", "left", "top", "right", "bottom", "padding",
                "padding-left", "padding-top", "padding-bottom", "padding-right", "margin",
                "margin-left", "margin-top", "margin-bottom", "margin-right", "font-size",
                "background-position", "line-height", "border-width", "border-left-width",
                "border-top-width", "border-right-width", "border-bottom-width"];
            var legality = this.check();
            this.ease = this.ease || (this.isTransform ? "ease-out" : o.easing.linear.easeOut);
            this.delay = this.delay || 0;
            if(!legality) throw new Error("Illegal arguments!");
            if(o.util.isObject(this.ease) && !this.isTransform) {
                this.requestAnimation = o.util.requestAnimation;
                if(this.delay > 0) {
                    var that = this;
                    window.setTimeout(function() {
                        that.executeWithJs();
                    }, this.delay * 1000);
                } else {
                    this.executeWithJs();
                }
            } else {
                this.vector = {"" : "", Webkit: "webkit", Moz: "", O: "o", ms: "MS"};
                for(var k in this.vector) {
                    if (this.el.style[k + "TransitionProperty"] !== undefined) {
                        this.prefix = '-' + k.toLowerCase() + '-'
                        this.eventPrefix = this.vector[k]
                        break;
                    }
                }
                this.isOffCss = (this.eventPrefix == null && this.el.style.transitionProperty == undefined);
                this.endEvent = this.eventPrefix ? this.eventPrefix + "TransitionEnd" : "transitionEnd";
                this.executeWithCss();
            }

        },

        /**
         * @private
         * @method check
         * @desc 检查参数是否ok
         */
        check: function() {
            var queue = o.util.isArray(this.propertyName) &&
                    o.util.isArray(this.startValue) && o.util.isArray(this.endValue),
                pass = false,
                _pass;
            if(!queue){
                this.propertyName = [this.propertyName];
                this.startValue = [this.startValue];
                this.endValue = [this.endValue];
            }
            var paramsMatch = (this.propertyName.length == this.startValue.length) &&
                    (this.startValue.length == this.endValue.length);
            if(paramsMatch) {
                var unOk = false,
                    len = this.propertyName.length,
                    i = len;
                for(; i--; ) {
                    _pass = this.checkValue(this.propertyName[i], this.startValue[i], this.endValue[i]);
                    if(!_pass) {
                        unOk = true;
                    }
                    this.needParams[i] = this.paramsDics.indexOf(this.propertyName[i]) != -1;
                    var isColor = new RegExp("/color|background-color|border-color/i").test(this.propertyName[i]);
                    this.colorList[i] = {
                        isColor: isColor,
                        startValue: isColor ? this.getColor(this.startValue[i]) : null,
                        endValue: isColor ? this.getColor(this.endValue[i]) : null
                    };
                }
                pass = !unOk && !isNaN(this.duration);
            } else {
                pass = false;
            }
            return pass;
        },

        /**
         * @private
         * @method checkValue
         * @desc 验证值是否合法
         */
        checkValue: function(propertyName, startValue, endValue){
            var pass = false;
            if(/transform/i.test(propertyName) || /-webkit-/i.test(propertyName)) {
                this.isTransform = true;
                pass = !!startValue && o.util.isString(startValue) && !!endValue && o.util.isString(endValue)
            } else if(propertyName.indexOf('color') != -1) {
                var reg = /(^\s*)|(\s*$)/g;
                pass = !!startValue && startValue.replace(reg, '') != '' && !! endValue && endValue.replace(reg, '') != ''
            } else {
                pass = !isNaN(startValue) && !isNaN(endValue);
            }
            return pass;
        },

        /**
         * @private
         * @method getColor
         */
        getColor: function(str) {
            str = str.replace(/(^\s*)|(\s*$)/g, '');
            var rgbReg = /^\s*rgb\s*\(\s*\d{1,3}\s*\,\s*\d{1,3}\s*\,\s*\d{1,3}\s*\)\s*$/i;
            var sixRegA = /^\s*\#[a-zA-Z0-9]{3}\s*$/;
            var sixRegB = /^\s*\#[a-zA-Z0-9]{6}\s*$/;
            var arr = [];
            if(rgbReg.test(str)){ // 以RGB形式指定的颜色
                var nStr = str.split('(')[1].split(')')[0].split(',');
                for(var i = 0 ; i < nStr.length ; i ++){
                    arr.push(nStr[i] / 1);
                }
                return arr;
            }
            if(sixRegB.test(str)) { // 以16进制指定颜色 (6位)
                var m = str.replace('#', '').match(/(\w|\d){2}/g);

                for(var i = 0 ; i < m.length; i ++){
                    arr.push(Number('0x' + m[i]).toString(10) / 1);
                }
                return arr;
            }
            if(sixRegA.test(str)){ // 以16进制指定颜色(3位)
                var cArr = str.replace('#', '').split('');
                for(var i = 0 ; i < cArr.length ; i ++){
                    arr.push(Number('0x' + (cArr[i] + cArr[i])).toString(10) / 1);
                }
                return arr;
            }
            return null;
        },

        /**
         * @private
         * @method executeWithJs
         * 执行
         */
        executeWithJs: function() {
            this.stopRequest = false;
            var that = this,
                curTime = 0;
            var animate = function() {
                if(!that.el || that.stopRequest){
                    that.stop();
                    return;
                }
                that.getSetValue(curTime, false);
                if(curTime >= that.duration * 1000){
                    that.getSetValue(null, true);

                    that.func && that.func();
                    that.el = null;
                    return;
                }
                curTime += 16;
                that.requestAnimation(animate);
            }
            this.requestAnimation(animate, this.el);
        },

        /**
         * @private
         * @method executeWithCss
         */
        executeWithCss: function() {
            if(this.isOffCss) this.duration = 0;
            var proarr = this.propertyName,
                len = proarr.length,
                that = this,
                transitionArr = [],
                _prefix = this.prefix + "transition";
            this.el.style[_prefix] = "";
            o.util.each(proarr, function(item, index) {
                that.el.style[item] = that.getValue(that.startValue[index], index);
                transitionArr.push(item + " " + that.duration + "s " + that.ease);
            });
            o.event.on(this.el, this.endEvent, o.util.bindAsEventListener(this.onEndEventCompleted, this), false);
            window.setTimeout(function() {
                that.el.style[_prefix] = transitionArr.join(", ");
                var _this = that;
                window.setTimeout(function() {
                    var z = 0;
                    for(; z < len; z++) {
                        var curValue = _this.endValue[z];
                        _this.el.style[proarr[z]] = _this.getValue(curValue, z);
                    }
                    _this.clearEventTimer();
                    _this.eventTimer = setTimeout(o.util.bind(_this.onFinish, _this), _this.duration * 1000);

                }, that.delay * 1000);
            }, 0);
        },

        /**
         * @private
         * @method clearEventTimer
         */
        clearEventTimer: function() {
            if(this.eventTimer) {
                window.clearTimeout(this.eventTimer);
                this.eventTimer = null;
            }
        },

        /**
         * @private
         * @method onFinish
         */
        onFinish: function() {
            if(this.el) {
                o.event.stopEventObserver(this.el, this.endEvent);
                this.el.style[this.prefix + "transition"] = "";
            }
            this.func && this.func();
            this.destroy();
        },

        /**
         * @private
         * @method onEndEventCompleted
         */
        onEndEventCompleted: function(e) {
            if(e.target !== e.currentTarget)    return;
            this.clearEventTimer();
            this.onFinish();
        },

        /**
         * @method octopus.Tween.stop
         * @desc 停掉动画 并解脱自我
         */
        stop: function() {
            if(this.endEvent == null) {
                this.stopRequest = true;
            } else {
                this.func && this.func();
                if(this.el) {
                    o.event.stopEventObserver(this.el, this.endEvent);
                    this.el.style[this.prefix + "transition"] = "";
                }
            }
            this.destroy();
        },

        /**
         * @method octopus.Tween.destroy
         * @desc 看名字就知道干嘛的
         */
        destroy: function() {
            this.el = null;
        },

        /**
         * @private
         * @method getSetValue
         * @desc 取出当前的属性值
         * Parameters:
         * curTime  -   {Number}
         * isEnd    -   {Boolean}
         */
        getSetValue: function(curTime, isEnd) {
            var valueInfo = [],
                i = 0,
                iLen = this.propertyName.length;
            for(; i < iLen; i++) {
                var curValue;
                if(this.colorList[i].isColor) {
                    var startRR = this.colorList[i].startValue[0],
                        startGG = this.colorList[i].startValue[1],
                        startBB = this.colorList[i].startValue[2],

                        endRR = this.colorList[i].endValue[0],
                        endGG = this.colorList[i].endValue[1],
                        endBB = this.colorList[i].endValue[2];

                    var rr, gg, bb;
                    if(isEnd) {
                        rr = endRR;
                        gg = endGG;
                        bb = endBB;
                    } else {
                        rr = Math.ceil(this.ease(curTime, startRR, endRR - startRR, this.duration * 1000));
                        gg = Math.ceil(this.ease(curTime, startGG, endGG - startGG, this.duration * 1000));
                        bb = Math.ceil(this.ease(curTime, startBB, endBB - startBB, this.duration * 1000));
                    }
                    curValue = 'rgb(' + rr + ', ' + gg + ', ' + bb + ')';
                } else {
                    if(isEnd) {
                        curValue = this.endValue[i];
                    } else {
                        curValue = this.ease(curTime, this.startValue[i], this.endValue[i] - this.startValue[i], this.duration * 1000);
                    }
                }
                valueInfo.push({
                    propertyName: this.propertyName[i],
                    curValue : curValue,
                    isColor: this.colorList[i].isColor
                });
            }
            this.setValue(valueInfo);

        },

        /**
         * @private
         * @method setValue
         * @desc 改变值
         */
        setValue: function(valueInfo) {
            var setInfo = {},
                needSet = false,
                i = 0,
                iLen = valueInfo.length;
            for(; i < iLen; i++) {
                var propertyName = valueInfo[i].propertyName,
                    curValue = valueInfo[i].curValue,
                    isColor = valueInfo[i].isColor;
                if(propertyName == 'scrollLeft' || propertyName == 'scrollTop') {
                    this.el[propertyName] = this.getValue(curValue, i);
                } else {
                    setInfo[propertyName] = isColor ? curValue : this.getValue(curValue, i);
                    needSet = true;
                }
            }

            if(needSet) {
                for(var key in setInfo) {
                    this.el.style[key] = setInfo[key];
                }
            }
        },

        /**
         * @private
         * @method getValue
         * @param value    -   {String}
         * @param order    -   {number}
         */
        getValue: function(value, order){
            return this.needParams[order] ? value + 'px' : value;
        },

        CLASS_NAME: "octopus.Tween"
    });

    /**
     * @class octopus.StepTween
     */
    o.StepTween = o.define({

        /**
         * @private
         * @property type
         * @type {String}
         * @desc 效果优先或性能优先
         */
        type: "normal",

        /**
         * @private
         * @property ease
         */
        ease: null,

        /**
         * @private
         * @property startValue
         * @type {String}
         */
        startValue: null,

        /**
         * @private
         * @property endValue
         * @type {String}
         */
        endValue: null,

        /**
         * @private
         * @property duration
         * @desc 与octopus.tween不同 这里的duration表示动画执行的次数
         */
        duration: null,

        /**
         * @private
         * @property func
         * @type {Function}
         */
        func: null,

        /**
         * @private
         * @property count
         */
        count: 0,

        /**
         * @private
         * @property playing
         * @type {Boolean}
         * @desc 标志位 标志是否在动画
         */
        playing: false,

        /**
         * @private
         * @constructor
         * @param options
         */
        initialize: function(options) {
            o.extend(this, options);
            this.ease = this.ease || o.easing.expo.easeOut;
            this.start(this.startValue, this.endValue, this.duration, this.func);
        },

        /**
         * @private
         * @method start
         * @param startValue
         * @param endValue
         * @param duration
         * @param func
         */
        start: function(startValue, endValue, duration, func) {
            this.playing = true;
            this.startValue = startValue;
            this.endValue = endValue;
            this.duration = duration;
            this.func = func;
            this.count = 0;
            if(this.func && this.func.start) {
                this.func.start.call(this, this.startValue);
            }
            o.util.requestAnimation(o.util.bind(this.play, this));
        },

        /**
         * @public
         * @method octopus.StepTween.stop
         * @desc 停止动画
         */
        stop: function() {
            if(!this.playing) return;

            if(this.func && this.func.done) {
                this.func.done.call(this, this.endValue);
            }
            this.playing = false;
            this.destroy();
        },

        /**
         * @private
         * @method destroy
         */
        destroy: function() {
            this.func = null;
            this.startValue = null;
            this.endValue = null;
            this.duration = null;
            this.count = null;
        },

        /**
         * @private
         * @method play
         */
        play: function() {
            if(this.playing == false)	return;
            var value = {};
            for(var k in this.startValue) {
                var b = this.startValue[k];
                var f = this.endValue[k];
                if(b == null || f == null || isNaN(b) || isNaN(f)) {
                    throw new Error('invalid value for Tween');
                }
                var c = f - b;
                value[k] = this.ease.apply(this, [this.count, b, c, this.duration]);
            }
            this.count++;
            if(this.func && this.func.eachStep) {
                this.func.eachStep.call(this, value);
            }
            if(this.count > this.duration) {
                this.stop();
                return;
            }
            o.util.requestAnimation(o.util.bind(this.play, this));
        },

        CLASS_NAME: "octopus.StepTween"
    });

    /**
     * @namespace octopus.easing
     * @desc 动画方法 每个方法都包括 "easeIn" 渐快 "easeOut" 渐慢 "easeInOut" 纠结的三个值可选
     */
    o.easing = o.easing || {};

    /**
     * @name octopus.easing.linear
     * @desc 线性动画
     */
    o.easing.linear = {

        /**
         * @name octopus.easing.linear.easeIn
         * @desc 线性渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c*t/d + b;
        },

        /**
         * @name octopus.easing.linear.easeOut
         * @desc 线性渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return c*t/d + b;
        },

        /**
         * @name octopus.easing.linear.easeInOut
         * @desc 线性纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            return c*t/d + b;
        }
    };

    /**
     * @name octopus.easing.expo
     * @desc 指数曲线的缓动
     *
     */
    o.easing.expo = {

        /**
         * @property octopus.easing.expo.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },

        /**
         * @property octopus.easing.expo.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },

        /**
         * @property octopus.easing.expo.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
    };

    /**
     * @name octopus.easing.quad
     * @desc 二次方的缓动
     */
    o.easing.quad = {

        /**
         * @property octopus.easing.quad.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c*(t/=d)*t + b;
        },

        /**
         * @property octopus.easing.quad.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return -c *(t/=d)*(t-2) + b;
        },

        /**
         * @property octopus.easing.quad.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        }
    };

    /**
     * @name octopus.easing.back
     * @desc 在过渡范围外的一端或两端扩展动画一次，以产生从其范围外回拉的效果。
     * 通俗讲就是先向后 再向反方向
     */
    o.easing.back = {

        /**
         * @property octopus.easing.back.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b
        },

        /**
         * @property octopus.easing.back.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b
        },

        /**
         * @property octopus.easing.back.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b
        }
    };

    /**
     * @name octopus.easing.bounce
     * @desc 在过渡范围的一端或两端内添加弹跳效果。类似一个球落向地板又弹起后，几次逐渐减小的回弹运动
     */
    o.easing.bounce = {

        /**
         * @property octopus.easing.bounce.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c - o.easing.bounce.easeOut(d - t, 0, c, d) + b
        },

        /**
         * @property octopus.easing.bounce.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b
            }
        },

        /**
         * @property octopus.easing.bounce.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if (t < d / 2) return o.easing.bounce.easeIn(t * 2, 0, c, d) * .5 + b;
            else return o.easing.bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b
        }
    };

    /**
     * @name octopus.easing.elastic
     * @desc 添加一端或两端超出过渡范围的弹性效果 其中的运动由按照指数方式衰减的正弦波来定义
     * 指数衰减的正弦曲线缓动
     */
    o.easing.elastic = {

        /**
         * @property octopus.easing.elastic.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return - (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b
        },

        /**
         * @property octopus.easing.elastic.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b)
        },

        /**
         * @property octopus.easing.elastic.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * (.3 * 1.5);
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return - .5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b
        }
    };

    /**
     * @name octopus.easing.circ
     * @desc 圆形曲线的缓动
     */
    o.easing.circ = {

        /**
         * @property octopus.easing.circ.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return - c * (Math.sqrt(1 - (t /= d) * t) - 1) + b
        },

        /**
         * @property octopus.easing.circ.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b
        },

        /**
         * @property octopus.easing.circ.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return - c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b
        }
    };

    /**
     * @name octopus.easing.sine
     * @desc 正弦曲线缓动
     */
    o.easing.sine = {

        /**
         * @property octopus.easing.sine.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return - c * Math.cos(t / d * (Math.PI / 2)) + c + b
        },

        /**
         * @property octopus.easing.sine.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b
        },

        /**
         * @property octopus.easing.sine.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            return - c / 2 * (Math.cos(Math.PI * t / d) - 1) + b
        }
    };

    /**
     * @name octopus.easing.quint
     * @desc 五次方的缓动
     */
    o.easing.quint = {

        /**
         * @property octopus.easing.quint.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b
        },

        /**
         * @property octopus.easing.quint.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b
        },

        /**
         * @property octopus.easing.quint.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b
        }
    };

    /**
     * @name octopus.easing.quart
     * @desc 四次方的缓动
     */
    o.easing.quart = {

        /**
         * @property octopus.easing.quart.easeIn
         * @desc 渐快
         *
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t * t * t + b
        },

        /**
         * @property octopus.easing.quart.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return - c * ((t = t / d - 1) * t * t * t - 1) + b
        },

        /**
         * @property octopus.easing.quart.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return - c / 2 * ((t -= 2) * t * t * t - 2) + b
        }
    };

    /**
     * @name octopus.easing.cubic
     * @desc 三次方的缓动
     */
    o.easing.cubic = {

        /**
         * @property octopus.easing.cubic.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t * t + b
        },

        /**
         * @property octopus.easing.cubic.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b
        },

        /**
         * @property octopus.easing.cubic.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b
        }
    };

})(octopus);
/**
 * @file
 * webapp通用组件基础库文件
 * 动画行为部分
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/event.js
 * @require lib/tween.js
 * @author oupeng-fe
 * @version 1.1
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @method octopus.animate
     * @param options {Object}
     * @param options.el {DOMElement} 进行动画的节点
     * @param options.type {String} 进行动画的类型
     * @param options.config {Object} 进行动画的参数
     * @return octopus.animation
     */
    o.animate = function(options) {
        return !!o.animation[options.type] ? (o.animation[options.type](options.el, options.config, options.func)) : null;
    };

    /**
     * @namespace octopus.animation
     */
    octopus.animation = octopus.animation || {

        /**
         * @method octopus.animation.slide
         */
        slide: function(el, config, func) {
            var options = o.extend({
                direction: "left",
                out: true,
                duration: .4,
                isFade: false,
                ease: "ease-out",
                isScale: false
            }, config);
            func = func || o.util.empty;
            var el = el,
                out = options.out,
                currentOpacity,
                toOpacity,
                direction = options.direction,
                toX = 0,
                toY = 0,
                fromX = 0,
                fromY = 0,
                elOffset = 100,
                ps = [],
                fvs = [],
                evs = [];
            if(direction == "left" || direction == "right") {
                if(out) {
                    toX = -elOffset;
                } else {
                    fromX = elOffset;
                }
            } else if(direction == "up" || direction == "down") {
                if(out) {
                    toY = -elOffset;
                }
                else {
                    fromY = elOffset;
                }
            }
            if (direction == 'right' || direction == 'down') {
                toY *= -1;
                toX *= -1;
                fromY *= -1;
                fromX *= -1;
            }
            ps.push("-webkit-transform");
            fvs.push("translate3d(" + fromX + "%, " + fromY + "%, 0)");
            evs.push("translate3d(" + toX + "%, " + toY + "%, 0)");
            if(options.isFade) {
                toOpacity = out ? 0 : 1;
                currentOpacity = out ? 1 : 0;
                fvs.push(currentOpacity);
                evs.push(toOpacity);
                ps.push("opacity");
            }
            if(options.isScale && out) {
                var fromScale = 1,
                    toScale = 0.8;
                fvs.push("scale(" + fromScale + ")");
                evs.push("scale(" + toScale + ")");
                ps.push("-webkit-transform");
                var _index = ps.indexOf("opacity");
                if(_index == -1) {
                    ps.push("opacity");
                    evs.push(out ? 1 : 0);
                    fvs.push(out ? 0 : 1);
                } else {
                    evs[_index] = out ? 1 : 0;
                    fvs[_index] = out ? 0 : 1;
                }
            }
            return new o.Tween(el, ps, fvs, evs, options.duration, func, {
                ease: options.ease
            });
        },

        /**
         * @method octopus.animation.fade
         */
        fade: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out"
            }, config);
            func = func || o.util.empty;
            var el = el,
                fromOpacity = 1,
                toOpacity = 1,
                out = options.out;
            if (out) {
                toOpacity = 0;
            } else {
                fromOpacity = 0;
            }
            var fv = [fromOpacity],
                ev = [toOpacity];
            return new o.Tween(el, ["opacity"], fv, ev, options.duration, func, {
                ease: options.ease
            });
        },

        /**
         * @method octopus.animation.pop
         */
        pop: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out",
                scaleOnExit: true
            }, config);
            func = func || o.util.empty;
            var el = el,
                fromScale = 1,
                toScale = 1,
                fromOpacity = 1,
                toOpacity = 1,
                curZ = o.dom.getStyle(el, 'z-index') || 0,
                fromZ = curZ,
                toZ = curZ,
                out = options.out;

            if (!out) {
                fromScale = 0.01;
                fromZ = curZ + 1;
                toZ = curZ + 1;
                fromOpacity = 0;
            } else {
                if (options.scaleOnExit) {
                    toScale = 0.01;
                    toOpacity = 0;
                } else {
                    toOpacity = 0.8;
                }
            }
            var ps = ["-webkit-transform", "-webkit-transform-origin", "opacity", "z-index"],
                fvs = ["scale(" + fromScale + ")", "50% 50%", fromOpacity, fromZ],
                evs = ["scale(" + toScale + ")", "50% 50%", toOpacity, toZ];
            return new o.Tween(el, ps, fvs, evs, options.duration, func, {
                ease: options.ease
            });
        },

        /**
         * @method octopus.animation.flip
         */
        flip: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out",
                direction: "left"
            }, config);
            func = func || o.util.empty;
            var el = el,
                direction = options.direction,
                rotateProp = 'Y',
                fromScale = 1,
                toScale = 1,
                fromRotate = 0,
                out = options.out,
                toRotate = 0;

            if (out) {
                toRotate = -180;
                toScale = 0.8;
            } else {
                fromRotate = 180;
                fromScale = 0.8;
            }

            if (direction == 'up' || direction == 'down') {
                rotateProp = 'X';
            }

            if (direction == 'right' || direction == 'left') {
                toRotate *= -1;
                fromRotate *= -1;
            }
            el.style.webkitBackfaceVisibility = "hidden"
            return new o.Tween(el, "-webkit-transform", 'rotate' + rotateProp + '(' + fromRotate + 'deg) scale(' + fromScale + ')',
                'rotate' + rotateProp + '(' + toRotate + 'deg) scale(' + toScale + ')', options.duration, func, {
                ease: options.ease
            });
        },

        /**
         * @method octopus.animation.wipe
         */
        wipe: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out"
            }, config);
            func = func || o.util.empty;
            var el = el,
                curZ = o.dom.getStyle(el, "z-index") || 0,
                zIndex,
                out = options.out,
                mask = '';

            if (!out) {
                zIndex = curZ + 1;
                mask = '-webkit-gradient(linear, left bottom, right bottom, from(transparent), to(#000), color-stop(66%, #000), color-stop(33%, transparent))';
                var _width = o.dom.getWidth(el);
                el.style.webkitMaskImage = mask;
                el.style.maskImage = mask;
                el.style.webkitMaskSize = _width * 3 + "px" + o.dom.getHeight(el) + "px";
                el.style.maskSize = _width * 3 + "px" + o.dom.getHeight(el) + "px";
                el.style.zIndex = zIndex;
                return new o.Tween(el, "-webkit-mask-position-x", "0", 0 - _width + "px",  options.duration, func, {
                    ease: options.ease
                });
            }
            window.setTimeout(func, options.duration * 1000);
            return null;
        },

        /**
         * @method octopus.animation.roll
         */
        roll: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out",
                isFade: false
            }, config);
            func = func || o.util.empty;
            var el = el,
                out = options.out,
                fromTransform = "translateX(-100%) rotate(-120deg)",
                toTransform = "translateX(0px) rotate(0deg)",
                ps = ["-webkit-transform"],
                fvs = [],
                evs = [];
            if(out) {
                var temp = fromTransform;
                fromTransform = toTransform;
                toTransform = temp;
            }
            fvs.push(fromTransform);
            evs.push(toTransform);
            if(options.isFade) {
                ps.push("opacity");
                fvs.push(options.out ? 1 : 0);
                evs.push(options.out ? 0 : 1);
            }
            return new o.Tween(el, ps, fvs, evs, options.duration, func, {
                ease: options.ease
            })
        },

        /**
         * @method octopus.animation.rotate
         */
        rotate: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out",
                horizon: "center",
                direction: "center",
                isFade: false
            }, config);
            func = func || o.util.empty;
            var el = el,
                out = options.out,
                ps = ["-webkit-transform"],
                fvs = [],
                fromTransform = "rotate(200deg)",
                toTransform = "rotate(0)",
                evs = [];
            if(options.direction == "up") {
                options.direction = "top";
            } else if(options.direction == "down") {
                options.direction = "bottom";
            }
            el.style.webkitTransformOrigin = options.horizon + " " + options.direction;
            if(options.horizon == "left") {
                fromTransform = "rotate(90deg)";
            } else if(options.horizon == "right") {
                fromTransform = "rotate(-90deg)";
            }
            if(out) {
                var temp = fromTransform;
                fromTransform = toTransform;
                toTransform = temp;
            }
            fvs.push(fromTransform);
            evs.push(toTransform);
            if(options.isFade) {
                ps.push("opacity");
                fvs.push(options.out ? 1 : 0);
                evs.push(options.out ? 0 : 1);
            }
            return new o.Tween(el, ps, fvs, evs, options.duration, func, {
                ease: options.ease
            });
        },

        /**
         * @method octopus.animation.fold
         */
        fold: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out",
                direction: "left",
                isFade: false
            }, config);
            func = func || o.util.empty;
            var el = el,
                out = options.out,
                direction = options.direction,
                transform = {
                    "left": {
                        "origin": "100% 50%",
                        "startTransform": "translateX(-100%) rotateY(-90deg)"
                    },
                    "right": {
                        "origin": "0% 50%",
                        "startTransform": "translateX(100%) rotateY(90deg)"
                    },
                    "up": {
                        "origin": "50% 100%",
                        "startTransform": "translateY(-100%) rotateX(90deg)"
                    },
                    "down": {
                        "origin": "50% 0%",
                        "startTransform": "translateY(100%) rotateX(-90deg)"
                    }
                },
                ps = ["-webkit-transform"],
                fvs = [],
                evs = [],
                fromTransform = transform[direction]["startTransform"],
                toTransform = "translate3d(0, 0, 0) rotate(0)";
            el.style.webkitTransformOrigin = transform[direction]["origin"];
            if(out) {
                var temp = fromTransform;
                fromTransform = toTransform;
                toTransform = temp;
            }
            fvs.push(fromTransform);
            evs.push(toTransform);
            if(options.isFade) {
                ps.push("opacity");
                fvs.push(options.out ? 1 : 0);
                evs.push(options.out ? 0 : 1);
            }
            return new o.Tween(el, ps, fvs, evs, options.duration, func, {
                ease: options.ease
            });
        },

        /**
         * @method octopus.animation.carousel
         */
        carousel: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out",
                direction: "left",
                isFade: false
            }, config);
            func = func || o.util.empty;
            var el = el,
                out = options.out,
                direction = options.direction,
                transform = {
                    "left": {
                        "originOut": "100% 50%",
                        "originIn": "0% 50%",
                        "startTransformOut": "translateX(-200%) scale(.4) rotateY(-65deg)",
                        "startTransformIn": "translateX(200%) scale(.4) rotateY(65deg)"
                    },
                    "right": {
                        "originOut": "0% 50%",
                        "originIn": "100% 50%",
                        "startTransformOut": "translateX(200%) scale(.4) rotateY(65deg)",
                        "startTransformIn": "translateX(-200%) scale(.4) rotateY(-65deg)"
                    },
                    "up": {
                        "originOut": "50% 100%",
                        "originIn": "50% 0%",
                        "startTransformOut": "translateY(-200%) scale(.4) rotateX(65deg)",
                        "startTransformIn": "translateY(200%) scale(.4) rotateX(-65deg)"
                    },
                    "down": {
                        "originOut": "50% 0%",
                        "originIn": "50% 100%",
                        "startTransformOut": "translateY(200%) scale(.4) rotateX(-65deg)",
                        "startTransformIn": "translateY(-200%) scale(.4) rotateX(65deg)"
                    }
                },
                ps = ["-webkit-transform"],
                fvs = [],
                evs = [],
                fromTransform = transform[direction]["startTransformOut"],
                toTransform = "translate3d(0, 0, 0) rotate(0)";
            el.style.webkitTransformOrigin = out ? transform[direction]["originIn"] : transform[direction]["originOut"];
            if(out) {
                fromTransform = toTransform;
                toTransform = transform[direction]["startTransformIn"];
            }
            fvs.push(fromTransform);
            evs.push(toTransform);
            if(options.isFade) {
                ps.push("opacity");
                fvs.push(options.out ? 1 : 0);
                evs.push(options.out ? 0 : 1);
            }
            return new o.Tween(el, ps, fvs, evs, options.duration, func, {
                ease: options.ease
            });
        }
    };
})(octopus);/**
 * @file
 * webapp通用组件基础库文件
 * 简单实现指定容器下的lazyload
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/event.js
 * @require lib/dom.js
 * @author oupeng-fe
 * @version 1.1
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @method octopus.lazyImg
     * @param opts
     */
    o.lazyImg = function(opts) {
        return new o.ImgLazyLoad(opts || {}).check();
    };

    /**
     * @class octopus.ImgLazyLoad
     * @desc 用来对指定图片或者容器内的图片进行延后加载
     * @param options 参数
     * @param options.imgs {String | Array | DOMElement} 需要延后加载的图片数组或节点或节点id
     * @param options.el {DOMElement | String} 需要延后加载的节点容器或节点容器id 如果已传入options.imgs 则此参数不生效
     * @param options.container {DOMElement | String} 出滚动条的容器
     * @param options.srcName {String} 延迟加载的图片的真实src属性字段默认为"src"
     */
    o.ImgLazyLoad = o.define({

        /**
         * @private
         * @property el
         * @type {DOMElement | String}
         * @desc 指定容器或图片
         */
        el: null,

        /**
         * @private
         * @property container
         * @type {DOMElement | String}
         * @desc 指定的滚动容器
         */
        container: null,

        /**
         * @private
         * @property imgs
         * @type {Array}
         * @desc 需要后加载的集合
         */
        imgs: null,

        /**
         * @private
         * @property srcName
         * @type {String}
         */
        srcName: "src",

        /**
         * @private
         * @property opts
         * @desc 传入的参数
         * @type {Object}
         */
        opts: null,

        /**
         * @private
         * @property isScroll
         * @type {Boolean}
         * @desc 标志位
         */
        isScroll: false,

        /**
         * @private
         * @property event
         * @type {octopus.Event}
         * @desc 自身事件
         */
        event: null,

        /**
         * @private
         * @constructor
         */
        initialize: function(options) {
            this.opts = o.extend({}, options);
            this.container = o.g(options.container) || document.body;
            var that = this,
                pnode = (this.container == document.body) ? window : this.container;
            var imgs = options.imgs;
            this.imgs = [];
            this.event = new o.Events(this);
            this.setDoms(imgs)
            o.event.on(pnode, "scroll", function() {
                if(!that.isScroll) {
                    o.util.requestAnimation(o.util.bind(that.check, that));
                    that.isScroll = true;
                }
            }, false);
            o.event.on(window, "ortchange", o.util.bind(this.reset, this), false);
        },

        /**
         * @public
         * @method octopus.ImgLazyLoad.on
         * @param evt {String} 事件监听名
         * @param func {Function} 回调函数
         * @desc 添加监听器
         */
        on: function(evt, func) {
            this.event.on(evt, func);
        },

        /**
         * @public
         * @method octopus.ImgLazyLoad.un
         * @param evt {String} 事件监听名
         * @param func {Function} 回调函数
         * @desc 卸载监听器
         */
        un: function(evt, func) {
            this.event.un(evt, func);
        },

        /**
         * @private
         * @method octopus.ImgLazyLoad.notify
         */
        notify: function(evt, opts) {
            this.event.triggerEvent(evt, opts);
        },

        /**
         * @private
         * @method setDoms
         * @desc 初始化图片节点
         */
        setDoms: function(imgs) {
            if(imgs) {
                if(o.util.isArray(imgs)) {
                    this.imgs = this.imgs.concat(imgs);
                } else {
                    var img = o.g(imgs);
                    o.util.isNode(img) && this.imgs.push(img);
                }
            } else if(this.opts.el) {
                this.el = this.el || o.g(this.opts.el);
                var _imgs = o.$("img", this.el),
                    len = _imgs.length;
                if(len > 0) {
                    var that = this;
                    o.util.each(_imgs, function(item) {
                        if(!o.util.isNode(item)) return;
                        if(!o.dom.data(item, "loaded") && o.dom.data(item, that.srcName)) {
                            that.imgs.push(item);
                        }
                    });
                } else if(this.el.tagName.toLowerCase() == "img" && !o.dom.data(this.el, "loaded") && o.dom.data(this.el, this.srcName)) {
                    this.imgs.push(this.el);
                }
            }
        },

        /**
         * @public
         * @method octopus.ImgLazyLoad.reset
         * @param imgs {String | Array | DOMELement} 新的需要加载的img 如果初始化时传入的是el 则此时不需要参数r
         * @desc 重置加载
         */
        reset: function(imgs) {
            this.setDoms(imgs);
            this.check();
        },

        /**
         * @public
         * @method octopus.ImgLazyLoad.check
         * @desc 查看当前是否符合加载条件
         */
        check: function() {
            this.isScroll = false;
            var len = this.imgs.length;
            if(len == 0)    return this;
            var t = this.container.scrollTop,
                h = o.dom.getHeight(this.container);
            if(this.container == document.body) {
                var _h = o.dom.getScreenHeight();
                h > _h && (h = _h);
            }
            var i = len;
            for(; i--; ) {
                var item = this.imgs[i];
                if(o.dom.data(item, "loaded")) {
                    this.imgs.splice(i, 1);
                    continue;
                }
                this.checkImg(item, t, h);
            }
            return this;
        },

        /**
         * @private
         * @method checkImg
         */
        checkImg: function(item, t, h) {
            var u = o.util;
            if(!u.isNode(item)) return;
            var d = o.dom,
                loaded = d.data(item, "loaded"),
                src = d.data(item, this.srcName);
            if(loaded)  return;
            var pos = d.getPosition(item),
                height = d.getHeight(item),
                top = pos.top;
            if(t >= top - h && t <= top + height + h) {
                var that = this;
                u.loadImage(src, u.empty, function() {
                    that.notify("imglazyload-core-loadimgsuccess", item);
                    d.attr(item, {
                        src: src,
                        "data-loaded": "loaded"
                    });

                }, function() {
                    that.notify("imglazyload-core-loadimgfaile", item);
                });
            }
        }
    });

})(octopus);/**
 * @file
 * webapp通用组件基础库文件
 * promise部分
 * @require lib/class.js
 * @author wencheng
 * @version 1.1
 */
;(function(o, undefined) {

    "use strict"

    if (typeof window.Promise === 'function' && typeof window.Promise.resolve === 'function') {
        return o.Promise = window.Promise;
    }

    var STATES = {
        PENDING: 0,
        RESOLVED: 1,
        REJECTED: 2
    }

    /**
     * @class octopus.Promise
     * @desc 跟es6的新Promise规范完全一致
     */
    var Promise = o.Promise = o.define({

        state: STATES.PENDING,
        resolves: null,
        rejects: null,
        data: null,
        reason: null,

        /**
         * @private
         * @constructor octopus.Promise
         * @param {Function} func - 初始化函数，有resolve, reject两个函数
         */
        initialize: function(func) {
            var promise = this;

            this.state = STATES.PENDING;
            var resolves = this.resolves = [];
            var rejects = this.rejects = [];

            // At first change promise state after resolve|reject
            this._done(function(data) {
                this.data = data;
                promise.state = STATES.RESOLVED;
            });
            this._fail(function(reason) {
                this.reason = reason;
                promise.state = STATES.REJECTED;
            });

            func.call(this, Promise.makeResolve(this), Promise.makeReject(this));
            return this;
        },

        /**
         * then 添加回调函数
         * @param  {Function} doneCallback - 成功回调函数
         * @param  {Function} failCallback - 失败回调函数
         * @return {Promise} 返回一个新的Promise实例
         */
        then: function(doneCallback, failCallback) {
            var promise = this;

            return new Promise(function(resolve, reject) {
                if (doneCallback != null) {
                    var modifiedDoneCallback = function(data) {
                    // 返回值null算不算
                    var returnVal = doneCallback.call(this, data);
                    if (Promise.isPromise(returnVal)) {
                        returnVal.then(resolve, reject);
                    } else {
                        resolve(returnVal);
                    }
                }
                promise._done(modifiedDoneCallback);
                } else {
                    promise._done(resolve);
                }
                promise._fail(failCallback == null ? reject : failCallback);
            });
        },
        /**
         * catch 捕捉错误，可以捕捉前面Promise队列未被捕捉的错误
         * @param  {Function} failCallback - 失败回调函数
         * @return {Promise} 新的Promise
         */
        catch: function(failCallback) {
            return this.then(null, failCallback);
        },

        /**
         * 内部添加成功回调，如果Promise已是成功状态，则直接执行成功回调
         * @private
         */
        _done: function(doneCallback) {
            if (this.state === STATES.RESOLVED) {
                return doneCallback.call(this, this.data);
            }
            this.resolves.push(doneCallback);
            return this;
        },

        /**
         * 内部添加失败回调，如果Promise已是失败状态，则直接执行失败回调
         * @private
         */
        _fail: function(failCallback) {
            if (this.state === STATES.REJECTED) {
                return failCallback.call(this, this.reason);
            }
            this.rejects.push(failCallback);
            return this;
        }
    });

    /**
     * Promise 可能的状态
     * @type {Object}
     */
    Promise.STATES = STATES;

    /**
     * 判断是否是类Promise对象
     * @param  {*}  obj
     * @return {Boolean}
     */
    Promise.isPromise = function(obj) {
        return obj != null && typeof obj['then'] === 'function';
    }

    /**
     * 生成Promise实例内的resolve方法
     * @param  {Promise} promise - Promise实例
     * @return {Function} resolve函数
     */
    Promise.makeResolve = function(promise) {
        return function(data) {
            if (promise.state > STATES.PENDING) return;

            var resolves = promise.resolves,
                doneCallback;

            while (doneCallback = resolves.shift()) {
                doneCallback.call(promise, data);
            }
        }
    }

    /**
     * 生成Promise实例内的reject方法
     * @param  {Promise} promise - Promise实例
     * @return {Function} reject函数
     */
    Promise.makeReject = function(promise) {
        return function(reason) {
            if (promise.state > STATES.PENDING) return;

            var rejects = promise.rejects,
                failCallback;

            while (failCallback = rejects.shift()) {
                failCallback.call(promise, reason);
            }
        }
    }

    /**
     * 返回Promise对象，以value值解决。如果传入的value是类Promise的对象，则已value这个Promise
     * 的结果作为Promise的决定值
     *
     * @param  {*} value
     * @return {Promise} 新的Promise对象
     */
    Promise.resolve = function(value) {
        return new Promise(function(resolve, reject) {
            if (Promise.isPromise(value)) {
                value.then(resolve, reject);
            } else {
                resolve(value);
            }
        })
    }

    /**
     * 返回一个失败原因reason的失败Promise
     * @param  {String} reason - 失败原因
     * @return {Promise}
     */
    Promise.reject = function(reason) {
        return new Promise(function(resolve, reject) {
            reject(reason);
        });
    }

    /**
     * 生成新Promise, 所有promises成功才成功，只要有一个promises失败就失败
     * @param  {Array} promises
     * @return {Promise} 新的Promise
     */
    Promise.all = function(promises) {
        return new Promise(function(resolve, reject) {
            function pending(callback) {
                var counter = 0,
                    values = [];

                return function() {
                    var curIndex = counter;
                    counter++;

                    return function(data) {
                        values[curIndex] = data;

                        if (--counter == 0) {
                            callback.call(window, values);
                        }
                    }

                }
            }
            var done = pending(function(values) {
                resolve(values)
            })
            for (var i = 0; i < promises.length; i++) {
                var promise = promises[i];
                promise.then(done(), reject);
            }
        });
    }

    /**
     * 返回一个新Promise, 如果有一个promise最先完成，则新Promise用最先完成的数据完成，如果
     * 有一个promise最新失败，则已最先失败的promise的原因失败
     * @param  {Array} promises
     * @return {Promise} 新Promise
     */
    Promise.race = function(promises) {
        return new Promise(function(resolve, reject) {
            for (var i = 0; i < promises.length; i++) {
                promises[i].then(resolve, reject);
            }
        });
    }

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

})(octopus);/**
 * @file
 * webapp通用组件父类
 * @author oupeng-fe
 * @version 1.1
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/dom.js
 * @require lib/event.js
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @class octopus.Widget
     * @desc octopus-ui的父类
     * @param options {Object}
     * @param options.el {DOMElement} 根节点 如果没有则创建一个div
     * @param options.id {String} widget的id 也会成为根节点的id
     * @param options.eventListeners {Object} 用以批量添加事件
     * @example
     * var widget = new Widget({
     *     id: "widget",
     *     eventListeners: {
     *         "onTouch": function onTouch() {},
     *         "onMove": function onMove() {},
     *         "scope": this
     *     }
     * });
     * @return new Widget
     */
    o.Widget = o.define({

        /**
         * @private
         * @property id
         * @type {String}
         */
        id: null,

        /**
         * @private
         * @property options
         * @type {Object}
         */
        options: null,

        /**
         * @private
         * @property el
         * @desc widget的根节点
         * @type {DOMELement}
         */
        el: null,

        /**
         * @private
         * @property container
         * @desc widget的容器
         * @type {DOMElement}
         */
        container: null,

        /**
         * @private
         * @property autoActivate
         * @desc 是否对像生成完就直接渲染，标志位
         * @type {Boolean}
         */
        autoActivate: false,

        /**
         * @private
         * @property active
         * @desc 是否处于激活状态
         * @type {Boolean}
         */
        active: false,

        /**
         * @private
         * @property events
         * @type {octopus.Events}
         */
        events: null,

        /**
         * @private
         * @property isShow
         * @type {Boolean}
         */
        isShow: false,

        /**
         * @private
         * @property gesture
         * @type {octopus.gesture}
         */
        gesture: null,

        /**
         * @private
         * @property eventListeners
         * @type {Object}
         * @desc 事件监听回调列表
         */
        eventListeners: null,

        /**
         * @private
         * @property widgetManager
         * @type {octopus.WidgetManager}
         * @desc widget管理器
         */
        widgetManager: null,

        /**
         * @private
         * @constructor octopus.Widget.initialize
         * @desc 构造函数
         * @param options  -   {Object}
         */
        initialize: function(options) {
            options = options || {};
            this.addOptions(options);
            this.events = new o.Events(this);
            this.gesture = o.gesture;
            this.id = this.id || o.util.createUniqueID(this.CLASS_NAME + "_");
            if(this.eventListeners instanceof Object) {
                this.events.register(this.eventListeners);
            }
            this.el = this.el || document.createElement("div");
            !!this.el.id ? this.id = this.el.id : this.el.id = this.id;
        },

        /**
         * @public
         * @method octopus.Widget.render
         * @desc 渲染
         * @param container {DOMElement}
         */
        render: function(container) {
            var len = arguments.length;
            if(len == 0) {
                this.container = this.container || document.body;
            } else {
                this.container = o.g(arguments[0]);
            }
            if(this.container.appendChild === undefined) {
                throw new Error("Illegal Dom!")
            } else {
                if(!!arguments[1]) {
                    var clonenode = o.dom.cloneNode(this.container, true);
                    this.appendChild(this.el, clonenode);
                    this.container.parentNode.replaceChild(clonenode, this.container);
                    this.container = clonenode;
                } else {
                    this.appendChild(this.el, this.container);
                }
            }
            if(!this.active) {
                this.activate();
            }
            if(!this.isShow) {
                this.show();
            }
        },

        /**
         * @private
         * @method octopus.Widget.appendChild
         */
        appendChild: function(dom, container) {
            container.appendChild(dom);
        },

        /**
         * @public
         * @method octopus.Widget.activate
         * @desc 激活控件
         */
        activate: function() {
            if(this.active) return;
            o.dom.addClass(this.el, "activate");
            this.active = true;
        },

        /**
         * @public
         * @method octopus.Widget.deactivate
         * @desc 挂起控件
         */
        deactivate: function() {
            if(!this.active)    return;
            o.dom.removeClass(this.el, "activate");
            this.active = false;
        },

        /**
         * @public
         * @method octopus.Widget.destroy
         * @desc 摧毁
         */
        destroy: function() {
            if(this.container) {
                this.container.removeChild(this.el);
                this.container = null;
            }
            this.el = null;
        },

        /**
         * @public
         * @method octopus.Widget.on
         * @desc 监听自定义事件 如果为手势事件 则监听的是根节点触发的
         * @param type {String}
         * @param func {Function}
         * @param opv {Object}
         */
        on: function(type, func, opv) {
            var GESTURES = o.Widget.GESTURES;
            if(GESTURES.indexOf(type) != -1) {
                this.gesture(this.el, opv).on(type, func);
                return;
            }
            this.events.on(type, func);
        },

        /**
         * @public
         * @method octopus.Widget.un
         * @desc 去除监听 与on相对
         * @param type {String}
         * @param func {Function}
         */
        un: function(type, func) {
            this.events.un(type, func);
        },

        /**
         * @public
         * @method octopus.Widget.notify
         * @desc 触发某自定义事件
         * @param type {String}
         * @param evt {Object}
         */
        notify: function(type, evt) {
            this.events.triggerEvent(type, evt);
        },

        /**
         * @private
         * @method addOptions
         * @desc 深度绑定
         * @param newOptions  -   {Object}
         */
        addOptions: function(newOptions) {
            if (this.options == null) {
                this.options = {};
            }
            o.extend(this.options, newOptions);
            o.extend(this, newOptions);
        },

        /**
         * @public
         * @method octopus.Widget.show
         * @desc 显示widget
         */
        show: function() {
            if(this.isShow) return;
            this.isShow = true;
            this.el.style.display = "block";
        },

        /**
         * @public
         * @method octopus.Widget.hidden
         * @desc 隐藏widget
         */
        hidden: function() {
            if(!this.isShow)    return;
            this.isShow = false;
            this.el.style.display = "none";
        },

        /**
         * @public
         * @method octopus.Widget.toggleVisible
         * @desc 切换显示状态
         */
        toggleVisible: function() {
            if(this.isShow) {
                this.hidden();
            } else {
                this.show();
            }
        },

        /**
         * @public
         * @method octopus.Widget.clone
         * @returns {*}
         */
        clone: function() {
            return eval("new " + this.CLASS_NAME + "(o.util.clone(this.options))");
        },

        /**
         * @public
         * @method octopus.Widget.getEl
         * @desc 拿widget的根节点
         */
        getEl: function() {
            return this.el;
        },

        /**
         * @public
         * @method octopus.Widget.getHeight
         * @desc 拿到widget的高度
         */
        getHeight: function() {
            return o.dom.getHeight(this.el) || o.dom.getStyle(this.el, "height");
        },

        /**
         * @public
         * @method octopus.Widget.getWidth
         * @desc 拿到widget的宽度
         */
        getWidth: function() {
            return o.dom.getWidth(this.el) || o.dom.getStyle(this.el, "width");
        },

        /**
         * @public
         * @method octopus.Widget.setManager
         * @desc widget被注册进widgetManager
         * @param m
         */
        setManager: function(m) {
            this.widgetManager = m;
        },

        /**
         * @public
         * @method octopus.Widget.setZIndex
         * @desc 设置控件的zindex值
         * @param z {String}
         */
        setZIndex: function(z) {
            this.el.style.zIndex = z;
        },

        CLASS_NAME: "octopus.Widget"
    });

    o.Widget.GESTURES = ["tap", "lontap", "doubletap", "swipe", "swipeleft",
        "swiperight", "swipeup", "swipedown", "drag", "drapleft", "dragright",
        "dragup", "dragdown", "touch", "release"];

    /**
     * @method octopus.widgetManager
     * @desc 返回一个widget的管理器
     * @param el {DOMElement}
     * @param opts {Object}
     * @returns {o.WidgetManager}
     */
    o.widgetManager = function(el, opts) {
        return new o.WidgetManager(el, opts);
    };

    /**
     * @class octopus.WidgetManager
     * @desc widget管理器
     * @param el {DOMElement} 管理器覆盖的节点 必须有的参数
     * @param opts {Object} 额外参数 非必需
     * @param opts.classFilter {String} 符合条件的节点必需包括这个class 默认为"octopusui-container"
     * @param opts.supportType {Array} 当前这个管理器支持的控件类型 默认为 slider refresh menu mask back2top
     */
    o.WidgetManager = o.define({

        /**
         * @private
         * @property el
         * @type {DOMElement}
         * @desc 管理器覆盖的节点容器
         */
        el: null,

        /**
         * @private
         * @property els
         * @type {Array}
         * @desc 符合条件的节点集合
         */
        els: null,

        /**
         * @private
         * @property opts
         * @desc 参数项
         */
        opts: null,

        /**
         * @private
         * @property classFilter
         * @type {String}
         * @desc 符合条件节点的class
         */
        classFilter: null,

        /**
         * @private
         * @property widgets
         * @desc 管理器里已拿到的控件
         * @type {Array}
         */
        widgets: null,

        /**
         * @private
         * @property supportType
         * @desc 支持的控件类型集合
         */
        supportType: null,

        /**
         * @private
         * @property event
         */
        event: null,

        /**
         * @private
         * @constructor
         * @param el {String | DOMElement} 解析的容器
         * @param opts {Object} 传入的参数
         */
        initialize: function(el, opts) {
            this.opts = o.extend({}, opts || {});
            this.el = o.g(el);
            if(!o.util.isNode(this.el))  throw new Error("require a node to initialize!");
            this.els = [];
            this.event = new o.Events(this);
            this.widgets = [];
            this.supportType = this.opts.supportType || ["slider", "back2top"];
            this.classFilter = this.opts.classFilter || ".octopusui-container";
            return this;
        },

        /**
         * @public
         * @method octopus.WidgetManager.init
         * @desc 开始对指定节点下的符合条件的html片段控件化
         */
        init: function() {
            var els = o.$(this.classFilter, this.el),
                that = this;
            o.util.each(els, function(item) {
                if(o.util.isNode(item)) {
                    that.els.push(item);
                }
            });
            if(this.els.length == 0)    return;
            o.util.each(this.els, o.util.bind(this.initWidgets, this));
        },

        /**
         * @private
         * @method initWidgets
         * @param item 单个widget的html片段的容器
         */
        initWidgets: function(item) {
            var type = o.dom.data(item, "octopusui-type"),
                index = this.supportType.indexOf(type);
            if(index == -1 || o.dom.data(item, "octopusui-loaded"))   return;
            var widget = this[this.supportType[index]](item);
            this.register(widget);
            o.dom.data(widget.el, {
                "octopusui-loaded": "true"
            });
        },

        /**
         * @private
         * @method getWidgetBy
         * @param type {String} 获取类型
         * @param filter {String} 获取节点的选择器
         */
        getWidgetBy: function(type, filter) {
            var widgets = [],
                len = this.widgets.length,
                i = len;
            for(; i--; ) {
                var widget = this.widgets[i];
                if(widget[type] == filter) {
                    if(type == "id") return widget;
                    widgets.push(widget);
                }
            }
            return widgets;
        },

        /**
         * @public
         * @method octopus.WidgetManager.getWidgetById
         * @param id {String}
         * @desc 根据widget的id拿到widget对象
         */
        getWidgetById: function(id) {
            return this.getWidgetBy("id", id);
        },

        /**
         * @public
         * @method octopus.WidgetManager.getWidgetByClass
         * @param c {String}
         * @desc 根据widget的class_name拿widget对象集合
         */
        getWidgetByClass: function(c) {
            return this.getWidgetBy("CLASS_NAME", c);
        },

        /**
         * @public
         * @method octopus.WidgetManager.slider
         * @desc 创建一个轮播图
         * @param el {DOMElement}
         */
        slider: function(el) {
            return o.Widget.slider(el);
        },

        /**
         * @public
         * @method octopus.WidgetManager.back2top
         * @desc 创建一个fixed的元素
         * @param el {DOMElement}
         */
        back2top: function(el) {
            return o.Widget.back2top(el);
        },

        /**
         * @public
         * @method octopus.WidgetManager.register
         */
        register: function(widget) {
            if(this.widgets.indexOf(widget) != -1)  return false;
            this.widgets.push(widget);
            widget.setManager(this);
        },

        /**
         * @public
         * @method octopus.WidgetManager.unregister
         */
        unregister: function(widget) {
            var index = this.widgets.indexOf(widget);
            if(index == -1) return false;
            this.widgets[index].setManager(null);
            this.widgets.splice(index, 1);
        },

        CLASS_NAME: "octopus.WidgetManager"
    });

})(octopus);/**
 * @file
 * @author oupeng-fe
 * @version 1.1
 * webapp通用组件
 * back2top   -   回到顶部
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/dom.js
 * @require lib/event.js
 * @require lib/tween.js
 * @require widget/widget.js
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @class octopus.Widget.Back2Top
     * @parent octopus.Widget
     * @desc 回到顶部控件
     * @param options {Object} 接受的参数
     * @param options.isFast {Boolean} 是否使用高性能（即当滚动时隐藏控件）模式 默认不采用
     * @param options.animation {Boolean} 返回顶部是否使用动画 默认不采用
     * @param options.bottom {Number} 控件距离底部的值
     * @param options.direction {String} 控件在左侧还是右侧 默认右侧 "right" || "left"
     * @param options.offsetV {Number} 控件距离左侧或者右侧的距离
     * @param options.customize {Boolean} 是否自定制点击控件后的回调 若为true则点击控件只触发自定义事件（back2top-ontap） 不返回顶部
     */
    o.Widget.Back2Top = o.define(o.Widget, {

        /**
         * @private
         * @property bottom
         * @type {Number}
         * @desc 控件距离底部距离
         */
        bottom: 10,

        /**
         * @private
         * @property direction
         * @type {String}
         */
        direction: "right",

        /**
         * @private
         * @property offsetV
         * @type {Number}
         * @desc 控件距离两侧的距离
         */
        offsetV: 10,

        /**
         * @private
         * @property isAbsolute
         * @desc 某些机器不支持fixed属性 用absolute代替
         * @type {Boolean}
         */
        isAbsolute: false,

        /**
         * @private
         * @property isFast
         * @type {Boolean}
         * @desc 是否在滚动中隐藏从而提高性能
         */
        isFast: false,

        /**
         * @private
         * @property scrollTimer
         * @type {Number}
         * @desc 用来优化性能的scroll时的定时器
         */
        scrollTimer: null,

        /**
         * @private
         * @property isScroll
         * @type {Boolean}
         * @desc 当前是否在scroll的标志位
         */
        isScroll: false,

        /**
         * @private
         * @property customize
         * @type {Boolean}
         * @desc 是否用户自定义点击事件
         */
        customize: false,

        /**
         * @private
         * @property animation
         * @type {Boolean}
         * @desc 是否有动画
         */
        animation: false,

        /**
         * @private
         * @property loop
         * @type {Object}
         * @desc 动画的内存寻址
         */
        loop: null,

        /**
         * @private
         * @property count
         * @type {Number}
         * @desc 动画计数
         */
        count: 0,

        /**
         * @private
         * @property testFixed
         * @type {Boolean}
         * @desc 是否测试过是否支持fixed属性
         */
        testFixed: false,

        /**
         * @private
         * @property testFixableDom
         * @type {DOMElement}
         * @desc 用来判断设备是否支持fixed的节点
         */
        testFixableDom: null,

        /**
         * @private
         * @constructor
         */
        initialize: function() {
            o.Widget.prototype.initialize.apply(this, arguments);
            o.dom.addClass(this.el, "octopusui-back2top");
            this.loop = {};
            this.initFixed();
            this.initEvent();
            this.testFixableDom = o.dom.createDom("div", null, {
                top: "5px",
                position: "fixed"
            });
        },

        /**
         * @private
         * @method initFixed
         * @desc 初始化fix属性 让其兼容所有浏览器
         */
        initFixed: function() {
            var that = this;
            if(/M031/.test(navigator.userAgent)) {
                this.setAbsolute();
            } else {
                var direction = this.direction;
                o.dom.setStyles(this.el, {
                    position: "fixed",
                    bottom: this.bottom + "px"
                });
                this.el.style[direction] = this.offsetV + "px";
            }
        },

        /**
         * @private
         * @method setAbsolute
         * @desc 将不支持fixed的节点设置为absolute
         */
        setAbsolute: function() {
            this.el.style.position = "absolute";
            this.isAbsolute = true;
            o.event.on(window, "ortchange", o.util.bind(this.onOrientationChanged, this));
        },

        /**
         * @private
         * @method onOrientationChanged
         */
        onOrientationChanged: function() {
            this.startFixed();
        },

        /**
         * @private
         * @method initEvent
         * @desc 事件初始化
         */
        initEvent: function() {
            this.isFast && o.event.on(document, "touchmove", o.util.bindAsEventListener(this.onTouchMove, this), false);
            o.event.on(document, "scroll", o.util.bindAsEventListener(this.onJudgeScroll, this), false);
            o.event.on(document, "touchend", o.util.bindAsEventListener(this.onTouchEnd, this), false);
            o.event.on(document, "touchcancel", o.util.bindAsEventListener(this.onTouchEnd, this), false);
            this.on("tap", o.util.bindAsEventListener(this.onTap, this));
        },

        /**
         * @private
         * @method onTap
         */
        onTap: function(e) {
            this.notify("back2top-ontap", e);
            !this.customize && this.goTo(1, this.animation);
        },

        /**
         * @public
         * @method octopus.Widget.Back2Top.goTo
         * @param y {Number}
         * @param animation {Boolean}
         * @desc 使页面滚到指定位置
         */
        goTo: function(y, animation) {
            if(!animation) {
                window.scrollTo(0, y);
            } else {
                var _y = window.pageYOffset;
                this.count = 0;
                var that = this;
                ++this.count;
                this.loop[this.count] = function() {
                    if(that.loop[that.count]) {
                        if (_y > (y - 1)) {
                            window.scrollBy(0, -Math.min(150, _y - y + 1));
                            _y -= 150;
                            o.util.requestAnimation(that.loop[that.count]);
                        } else {
                            that.loop[that.count] = null;
                        }
                    } else {
                        that.loop[that.count] = null;
                    }
                }
                o.util.requestAnimation(this.loop[this.count]);
            }
        },

        /**
         * @private
         * @method onTouchEnd
         * @desc 判断是否应该显示
         */
        onTouchEnd: function() {
            this.checkIfVisible();
        },

        /**
         * @private
         * @method onJudgeScroll
         */
        onJudgeScroll: function() {
            if(!this.isScroll) {
                o.util.requestAnimation(o.util.bind(this.onScroll, this));
                this.isScroll = true;
            }
        },

        /**
         * @private
         * @method onScroll
         */
        onScroll: function() {
            this.clearTimer();
            this.isFast && this.hidden();
            this.isAbsolute && this.startFixed();
            this.scrollTimer = window.setTimeout(o.util.bind(this.onScrollStop, this), 300);
            this.isScroll = false;
        },

        /**
         * @private
         * @method onScrollStop
         */
        onScrollStop: function() {
            this.isAbsolute && this.startFixed();
            !this.testFixed && this.testFixable();
            this.checkIfVisible();
        },

        /**
         * @private
         * @method testFixable
         * @desc 判断当前设备是否支持fixed属性
         */
        testFixable: function() {
            this.testFixed = true;
            if(this.testFixableDom.offsetTop != 5) {
                this.setAbsolute();
            }
            document.body.removeChild(this.testFixableDom);
            this.testFixableDom = null;
        },

        /**
         * @private
         * @method checkIfVisible
         */
        checkIfVisible: function() {
            window.pageYOffset > document.documentElement.clientHeight ? this.show() : this.hidden()
        },

        /**
         * @private
         * @method onTouchMove
         */
        onTouchMove: function() {
            this.hidden();
        },

        /**
         * @private
         * @method clearTimer
         */
        clearTimer: function() {
            if(this.scrollTimer) {
                window.clearTimeout(this.scrollTimer);
                this.scrollTimer = null;
            }
        },

        /**
         * @private
         * @method startFixed
         * @desc 当设备不支持fixed时用absolute的滚动
         */
        startFixed: function() {
            if(!this.active)    return;
			var direction = this.direction == "right" ? "left" : "right";
            o.dom.setStyles(this.el, {
                top: window.pageYOffset + window.innerHeight - parseInt(this.getHeight()) - this.bottom + "px"
            });
            this.el.style[direction] = document.body.offsetWidth - parseInt(this.getWidth()) - this.offsetV + "px";
        },

        /**
         * @private
         * @method render
         */
        render: function() {
            var b = document.body,
                fragment = document.createDocumentFragment();
            this.container = b;
            fragment.appendChild(this.el);
            fragment.appendChild(this.testFixableDom)
            this.appendChild(fragment, this.container);
            if(this.isShow) {
                this.isShow = false;
                this.show();
            }
            if(!this.active) {
                this.activate();
            }
        },

        CLASS_NAME: "octopus.Widget.Back2Top"
    });

    /**
     * @method octopus.Widget.back2top
     * @desc 生成与html模版相绑定的回到顶部 所有的参数都以html模版形式传入
     * @param el
     * @returns {o.Widget.HtmlBack2Top}
     */
    o.Widget.back2top = function(el) {
        return new o.Widget.HtmlBack2Top({
            el: el
        });
    };

    /**
     * @class octopus.Widget.HtmlBack2Top
     * @parent octopus.Widget.Back2Top
     * @desc 参数与octopus.Widget.Back2Top 不同的是 这个类仅限于对已有符合规范的html模版的改造与封装
     * 符合条件的html模版属性包括
     * data-octopusui-back2top-direction 可以指定控件的左右 "left" || "right"
     * data-octopusui-back2top-fast 如果设置此属性 使用高性能（即当滚动时隐藏控件）模式
     * data-octopusui-back2top-animate 如果设置此属性 返回顶部会使用动画
     * data-octopusui-back2top-bottom 设置距底部的距离 默认为10
     * data-octopusui-back2top-offset 设置距左｜右的距离 默认为10
     * data-octopusui-back2top-customize 如果设置此属性 则需要自定义点击后的事件
     */
    o.Widget.HtmlBack2Top = o.define(o.Widget.Back2Top, {

        /**
         * @private
         * @constructor
         */
        initialize: function(opts) {
            o.Widget.prototype.initialize.apply(this, arguments);
            this.loop = {};
            this.direction = o.dom.data(this.el, "octopusui-back2top-direction") || this.direction;
            this.isFast = o.dom.data(this.el, "octopusui-back2top-fast");
            this.animation = o.dom.data(this.el, "octopusui-back2top-animate");
            this.bottom = o.dom.data(this.el, "octopusui-back2top-bottom") || this.bottom;
            this.offsetV = o.dom.data(this.el, "octopusui-back2top-offset") || this.offsetV;
            this.customize = o.dom.data(this.el, "octopusui-back2top-customize");
            this.testFixableDom = o.dom.createDom("div", null, {
                top: "5px",
                position: "fixed"
            });
            if(this.isShow) {
                this.isShow = false;
                this.show();
            }
            if(!this.active) {
                this.activate();
            }
            this.checkDom();
            this.initEvent();
        },

        /**
         * @private
         * @method render
         * @desc 防止被调用
         */
        render: function() {
            throw new Error("this class can't render! :)");
        },

        /**
         * @private
         * @method checkDom
         * @desc 初始化dom
         */
        checkDom: function() {
            this.el.style.display = "none";
            this.isShow = false;
            o.dom.addClass(this.el, "octopusui-back2top");
            this.initFixed();
            var parent = this.el.parentNode,
                body = document.body;
            this.container = body;
            if(parent != body) {
                parent.removeChild(this.el);
                body.appendChild(this.el);
            }
            body.appendChild(this.testFixableDom);
        },

        CLASS_NAME: "octopus.Widget.HtmlBack2Top"
    });

})(octopus);/**
 * @file
 * @author oupeng-fe
 * @version 1.1
 * webapp通用组件
 * mask   -   浮层
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/dom.js
 * @require lib/event.js
 * @require lib/tween.js
 * @require lib/animate.js
 * @require widget/widget.js
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @class octopus.Widget.Mask
     * @parent octopus.Widget
     * @desc 浮层遮罩
     * @param options {Object} 参数
     * @param options.isScroll {Boolean} 浮层浮出时，是否禁掉背后的滚动条事件，false禁掉，默认值为false
     * @param options.animation {String} 浮层浮出的动化类型，默认无动画 支持的类型有
     * "fade" -- 渐隐渐出
     * "scale" -- 中部呼出
     * "rotate" -- 左上角转入 左下角转出
     * "slideLeft", "slideRight", "slideUp", "slideDown" -- 与<octopus.animation>保持一致
     * @param options.innerHTML {String} 浮层弹出的内容
     */
    o.Widget.Mask = o.define(o.Widget, {

        /**
         * @private
         * @property isScroll
         * @type {Boolean}
         * @desc 是否可以滚动 默认不可以
         */
        isScroll: false,

        /**
         * @private
         * @property isResize
         * @type {Boolean}
         * @desc 标志位 判断当前是否处在resize事件执行
         */
        isResize: false,

        /**
         * @private
         * @property animation
         * @type {String}
         * @desc 参数 表明浮层浮出的动画类型
         */
        animation: null,

        /**
         * @private
         * @property origin
         * @type {String}
         * @desc 浮层动画起始点 只有当animation为"scale"时生效
         */
        origin: null,

        /**
         * @private
         * @property innerHTML
         * @type {String}
         * @desc 浮层的内容
         */
        innerHTML: null,

        /**
         * @private
         * @constructor
         */
        initialize: function() {
            o.Widget.prototype.initialize.apply(this, arguments);
            o.dom.addClass(this.el, "octopusui-mask");
            if(this.innerHTML) {
                this.el.innerHTML = this.innerHTML;
            }
        },

        /**
         * @private
         * @method initEvent
         * @desc 初始化事件
         */
        initEvent: function() {
            !this.isScroll && o.event.on(document, "touchmove", o.util.bindAsEventListener(this.onTouchMove, this), false);
			o.event.on(window, "ortchange", o.util.bind(this.calcSelfSize, this), false);
        },

        /**
         * @private
         * @method calcSelfSize
         * @desc 监听window.onresize事件
         */
        calcSelfSize: function() {
            if(!this.isResize) {
                o.util.requestAnimation(o.util.bind(this.refreshSize, this));
                this.isResize = true;
            }
        },

        /**
         * @private
         * @method onTouchMove
         * @desc isScroll为false时 禁掉滚动条的滚动
         */
        onTouchMove: function(e) {
            this.isShow && o.event.stop(e);
        },

        /**
         * @public
         * @method octopus.Widget.Mask.render
         * @desc 复写父类方法
         */
        render: function(container, clone, origin) {
            if(this.animation == "scale" && origin) {
                this.origin = origin;
            }
            o.Widget.prototype.render.apply(this, arguments);
        },

        /**
         * @public
         * @method octopus.Widget.Mask.activate
         * @desc 复写父类方法 在节点扔进dom流后做的初始化
         */
        activate: function() {
            o.Widget.prototype.activate.apply(this, arguments);
            this.refreshSize();
            this.initEvent();
        },

        /**
         * @public
         * @method octopus.Widget.Mask.refreshSize
         * @desc 计算当前遮罩的大小
         */
        refreshSize: function() {
            var position = o.dom.getStyle(this.container, "position");
            if(position == "static") {
                this.container.style.position = "relative";
            }
            o.dom.setStyles(this.el, {
                width: "100%",
                left: "0px",
                height: Math.max(this.container.scrollHeight, this.container.clientHeight) + "px"
            }, false);
            this.isResize = false;
        },

        /**
         * @public
         * @method octopus.Widget.Mask.show
         */
        show: function(origin) {
            if(this.isShow) return;
            if(origin && origin != this.origin) {
                this.origin = origin;
            }
            if(this.origin) {
                this.el.style.webkitTransformOrigin = this.origin.left + "px " + this.origin.top + "px";
            }
            this.isShow = true;
            this.el.style.visibility = "visible";
            if(!!this[this.animation]) {
                this[this.animation](true);
            }
        },

        /**
         * @public
         * @method octopus.Widget.Mask.hidden
         */
        hidden: function() {
            if(!this.isShow)    return;
            this.isShow = false;
            if(!!this[this.animation]) {
                this[this.animation](false);
            } else {
                this._hidden();
            }
        },

        /**
         * @private
         * @method _hidden
         */
        _hidden: function() {
            this.el.style.visibility = "hidden";
            this.el.style.webkitTransformOrigin = "";
            if(this.origin) {
                this.origin = null;
            }
        },

        /**
         * @private
         * @method fade
         * @param out {Boolean}
         */
        fade: function(out) {
            if(out) {
                new o.Tween(this.el, "opacity", 0, 1, .3, o.util.empty, {
                    ease: "ease-out"
                });
            } else {
                new o.Tween(this.el, "opacity", 1, 0, .3, o.util.bind(this._hidden, this), {
                    ease: "ease-out"
                });
            }
        },

        /**
         * @private
         * @method scale
         * @param out {Boolean}
         */
        scale: function(out) {
            if(out) {
                new o.Tween(this.el, ["opacity", "-webkit-transform"], [0, "scale(0)"], [1, "scale(1)"], .3);
            } else {
                new o.Tween(this.el, ["opacity", "-webkit-transform"], [1, "scale(1)"], [0, "scale(0)"], .3, o.util.bind(this._hidden, this));
            }
        },

        /**
         * @private
         * @method rotate
         * @param out {Boolean}
         */
        rotate: function(out) {
            this.el.style.webkitTransformOrigin = "left bottom";
            var that = this;
            if(out) {
                new o.Tween(this.el, ["opacity", "-webkit-transform"], [0, "rotate(-90deg)"], [1, "rotate(0deg)"], .3);
            } else {
                new o.Tween(this.el, ["opacity", "-webkit-transform"], [1, "rotate(0deg)"], [0, "rotate(90deg)"], .3, function() {
                    that._hidden();
                });
            }
        },

        /**
         * @private
         * @method slideLeft
         * @param out {Boolean}
         */
        slideLeft: function(out) {
            this.animate("slide", "left", out);
        },

        /**
         * @private
         * @method slideRight
         * @param out
         */
        slideRight: function(out) {
            this.animate("slide", "right", out);
        },

        /**
         * @private
         * @method slideUp
         * @param out
         */
        slideUp: function(out) {
            this.animate("slide", "up", out);
        },

        /**
         * @private
         * @method slideDown
         * @param out
         */
        slideDown: function(out) {
            this.animate("slide", "down", out);
        },

        /**
         * @private
         * @method animate
         * @param type {String}
         * @param direction {String}
         * @param out {Boolean}
         */
        animate: function(type, direction, out) {
            var func = out ? o.util.empty : o.util.bind(this._hidden, this);
            o.animate({
                el: this.el,
                type: type,
                func: func,
                config: {
                    direction: direction,
                    out: !out,
                    isFade: true
                }
            });
        },

        CLASS_NAME: "octopus.Widget.Mask"
    });

})(octopus);/**
 * @file
 * @author oupeng-fe
 * @version 1.1
 * webapp通用组件
 * menu   -   菜单
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/dom.js
 * @require lib/event.js
 * @require lib/tween.js
 * @require lib/animate.js
 * @require widget/widget.js
 */
;(function(o, undefined) {

    "use strict";

    /**
    * @class octopus.Widget.Menu
    * @parent octopus.Widget
    * @param options {Object} 参数
    * @param options.data {Array} 生成菜单的数据
    * @param options.animateType {String} 菜单切换的时候的动画类型 设置为null 则无动画 目前支持的类型有slide fold fade flip pop rotate 默认为slide
    * @param options.direction {String} 动画执行的方向 目前支持 left up down right 默认为left
    * @param options.showAnimateType {String} 菜单显示隐藏时候的动画类型 支持与使用 同animateType一致 默认为fade
    * @param options.backContent {String} 返回菜单的文案 默认为"返回上一级"
    */
    o.Widget.Menu = o.define(o.Widget, {

        /**
         * @private
         * @property data
         * @type {Array}
         * @desc 生成菜单的数据源
         */
        data: null,

        /**
         * @private
         * @property animateType
         * @type {String}
         * @desc 切换时使用的动画类型
         */
        animateType: "slide",

        /**
         * @private
         * @property direction
         * @type {String}
         * @desc 切换动画的方向
         */
        direction: "left",

        /**
         * @private
         * @property showAnimateType
         * @type {String}
         * @desc 显示时的动画类型
         */
        showAnimateType: null,

        /**
         * @private
         * @property currentMenuUl
         * @type {DOMElement}
         * @desc 当前被打开的menu的容器节点
         */
        currentMenuUl: null,

        /**
         * @private
         * @property rootUl
         * @type {DOMElement}
         */
        rootUl: null,

        /**
         * @private
         * @property openLi
         * @type {DOMElement}
         * @desc 每次展开的li节点
         */
        openLi: null,

        /**
         * @private
         * @property backContent
         * @type {String}
         * @desc 返回菜单的文案
         */
        backContent: "返回上一级",

        /**
         * @private
         * @property DIRECTION
         * @desc 用来保存direction的相对方向
         */
        DIRECTION: null,

        /**
         * @private
         * @constructor
         */
        initialize: function() {
            o.Widget.prototype.initialize.apply(this, arguments);
            if(!this.data)	throw new Error("require the property of data!");
            var root = this.buildMenu(this.data);
            this.DIRECTION = {
                "left": "right",
                "right": "left",
                "up": "down",
                "down": "up"
            };
            o.dom.setStyles(this.el, {
                position: "absolute",
                width: "100%",
                "-webkit-backface-visibility": "hidden"
            }, true);
            o.dom.addClass(this.el, "octopusui-menu");
            this.el.appendChild(root);
            this.gesture(root).on("tap", o.util.bindAsEventListener(this.onTap, this));
        },

        /**
         * @private
         * @method buildMenu
         * @desc 生成节点结构
         * @param data {Array}
         * @param isChild {Boolean}
         */
        buildMenu: function(data, isChild) {
            isChild = isChild || false;
            var uldom = document.createElement("ul"),
                fragment = document.createDocumentFragment(),
                len = data.length,
                i = 0;
            if(isChild) {
                var dom = o.dom.createDom("li", {
                        "class": "octopusui-menu-returnparent"
                    }),
                    _adom = document.createElement("a");
                _adom.innerHTML = this.backContent;
                dom.appendChild(_adom);
                fragment.appendChild(dom);
                o.dom.addClass(uldom, "octopusui-menu-childmenu");
            } else {
                o.dom.addClass(uldom, "octopusui-menu-ul");
                this.rootUl = uldom;
            }
            for(; i < len; i++) {
                var itemData = data[i],
                    lidom = o.dom.createDom("li", {
                        id: itemData.id || itemData.name
                    }),
                    adom = document.createElement("a");
                if(itemData.children && itemData.children.length > 0) {
                    o.dom.addClass(lidom, "octopusui-menu-haschild")
                    var fragdom = this.buildMenu(itemData.children, true);
                }
                if(itemData.href) {
                    o.dom.data(lidom, {
                        href: itemData.href
                    });
                }
                adom.innerHTML = o.util.encodeHtml(itemData.name);
                lidom.appendChild(adom);
                fragdom && lidom.appendChild(fragdom);
                fragment.appendChild(lidom);
            }
            uldom.appendChild(fragment);
            return uldom;
        },

        /**
         * @private
         * @method onTap
         * @desc 监听被点击事件 会发出自定义事件 "menu-item-ontap"
         */
        onTap: function(e) {
            o.event.stop(e, true);
            var t = e.target,
                tagname = t.tagName.toUpperCase();
            if(tagname == "A") {
                t = t.parentNode;
            }
            if(o.dom.hasClass(t, "octopusui-menu-disable"))	return;
            this.notify("menu-item-ontap", t);
            if(o.dom.hasClass(t, "octopusui-menu-haschild")) {
                this.expendMenu(t);
            }
            if(o.dom.hasClass(t, "octopusui-menu-returnparent")) {
                this.returnParent(t);
            }
        },

        /**
         * @private
         * @method returnParent
         * @param el
         * @desc 点击返回按钮时菜单的反应
         */
        returnParent: function(el) {
            o.dom.removeClass(this.openLi, "octopusui-menu-openmenu");
            if(this.currentMenuUl == this.rootUl) {
                o.dom.removeClass(this.rootUl, "octopusui-menu-childview");
            } else {
                var parent = this.currentMenuUl.parentNode;
                o.dom.removeClass(parent, "octopusui-menu-childview");
                o.dom.addClass(parent, "octopusui-menu-openmenu");
                this.openLi = parent;
                this.currentMenuUl = this.openLi.parentNode;
            }
            var direction = this.DIRECTION[this.direction] || "left";
            if(this.animateType) {
                this[this.animateType](this.openLi, direction);
            }
        },

        /**
         * @private
         * @method changedExpendItem
         * @desc 当展开节点的时候 调整样式
         */
        changedExpendItem: function(closedom, expenddom) {
            var vc = "octopusui-menu-childview";
            this.currentMenuUl = closedom;
            expenddom == this.rootUl ? o.dom.removeClass(this.rootUl, vc) :
            o.dom.addClass(this.rootUl, vc);
        },

        /**
         * @private
         * @method expendMenu
         * @param dom {DOMElement}
         * @desc 待展开的分类节点操作
         */
        expendMenu: function(dom) {
            var expendMenu = dom.children[1],
                parent = dom.parentNode,
                oc = "octopusui-menu-openmenu";
            if(this.openLi) {
                o.dom.removeClass(this.openLi, oc);
                o.dom.addClass(this.openLi, "octopusui-menu-childview");
            }
            this.openLi = dom;
            o.dom.addClass(this.openLi, "octopusui-menu-openmenu");
            this.changedExpendItem(parent, expendMenu);
            if(this.animateType) {
                this[this.animateType](expendMenu, this.direction);
            }
        },

        /**
         * @private
         * @method animate
         * @param el {DOMElement}
         * @param type {String}
         * @param direction {String}
         * @param out {Boolean}
         * @param func {Function}
         * @desc 动画方法
         */
        animate: function(el, type, direction, out, func) {
            var func = func || o.util.empty;
            o.animate({
                el: this.el,
                type: type,
                func: func,
                config: {
                    direction: direction,
                    out: !out,
                    isFade: true,
                    duration: .3
                }
            });
        },

        /**
         * @public
         * @method octopus.Widget.Menu.show
         * @desc 显示控件
         */
        show: function() {
            o.Widget.prototype.show.apply(this, arguments);
            if(this.showAnimateType) {
                this[this.showAnimateType](this.el, true);
            }
        },

        /**
         * @public
         * @method octopus.Widget.Menu.hidden
         * @desc 隐藏控件
         */
        hidden: function() {
            var h = o.Widget.prototype.hidden;
            if(this.showAnimateType) {
                var that = this;
                this[this.showAnimateType](this.el, false, function() {
                    h.apply(that, arguments);
                    that.resetMenu();
                });
            } else {
                h.apply(this, arguments);
                this.resetMenu();
            }
        },

        /**
         * @private
         * @method slide
         * @param el {DOMElement}
         * @param direction {String}
         * @param func {Function}
         */
        slide: function(el, direction, func) {
            this.animate(el, "slide", direction, true, func);
        },

        /**
         * @private
         * @method fold
         * @param el
         * @param direction
         * @param func
         */
        fold: function(el, direction, func) {
            this.animate(el, "fold", direction, true, func);
        },

        /**
         * @private
         * @method fade
         * @param el {DOMELement}
         * @param out {Boolean}
         * @param func {Function}
         */
        fade: function(el, out, func) {
            this.animate(el, "fade", null, out, func);
        },

        /**
         * @private
         * @method flip
         * @param el {DOMElement}
         * @param direction {String}
         * @param func {Function}
         */
        flip: function(el, direction, func) {
            this.animate(el, "flip", direction, true, func);
        },

        /**
         * @private
         * @method pop
         * @param el {DOMElement}
         * @param out {Boolean}
         * @param func {Function}
         */
        pop: function(el, out, func) {
            this.animate(el, "pop", null, out, func);
        },

        /**
         * @private
         * @method rotate
         * @param el {DOMElement}
         * @param out {Boolean}
         * @param func {Function}
         */
        rotate: function(el, out, func) {
            this.animate(el, "rotate", null, out, func);
        },

        /**
         * @public
         * @method octopus.Widget.Menu.resetMenu
         * @desc 重置菜单
         */
        resetMenu: function() {
            this.rootUl && o.dom.removeClass(this.rootUl, "octopusui-menu-childview");
            this.openLi && o.dom.removeClass(this.openLi, "octopusui-menu-openmenu");
            this.openLi = null;
            this.currentMenuUl = null;
        },

        CLASS_NAME: "octopus.Widget.Menu"
    });

})(octopus);/**
 * @file
 * @author oupeng-fe
 * @version 1.1
 * webapp通用组件
 * pic-reader   -   图片预览
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/dom.js
 * @require lib/event.js
 * @require widget/widget.js
 * @require widget/mask/mask.js
 * @require widget/slider/slider.js
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @class
     * @parent octopus.Widget.Mask
     * @param opts 传入的参数
     * @param opts.imgEl {DOMElement} 可以通过传入一个节点解析节点下所有的img标签
     * @param opts.imgs {Array} 解析的img标签集合 可以与imgEl共存
     * @param opts.maxW {Number} 屏幕的宽度 可传可不传 传的好处少一次repaint
     * @param opts.maxH {Number} 屏幕的高度减去60px 可传可不传 同上
     * @param opts.hasButton {Boolean} 同octopus.Widget.Slider中的hasButton 默认为false
     * @param opts.hasGizmos {Boolean} 同上 默认为false
     * @param opts.hasTitle {Boolean} 同上 默认为false
     */
    o.Widget.PicReader = o.define(o.Widget.Mask, {

        /**
         * @private
         * @property imgEl
         * @type {DOMElement}
         * @desc 图片阅读涉及到的根结点
         */
        imgEl: null,

        /**
         * @private
         * @property sliderEl
         * @type {DOMElement}
         * @desc 里面一些东西的容器
         */
        sliderEl: null,

        /**
         * @private
         * @property imgCEl
         * @type {DOMElement}
         * @desc 显示区域图片的容器
         */
        imgCEl: null,

        /**
         * @private
         * @property isResize
         * @type {Boolean}
         * @desc 标志位 为了让resize触发的再少一些
         */
        isResize: false,

        /**
         * @private
         * @property maxW
         * @type {Number}
         * @desc 屏幕的宽度
         */
        maxW: null,

        /**
         * @private
         * @property maxH
         * @type {Number}
         * @desc 屏幕的高度减去60
         */
        maxH: null,

        /**
         * @private
         * @property imgs
         * @type {Array}
         * @desc 传入的图片节点集合
         */
        imgs: null,

        /**
         * @private
         * @property datas
         * @type {Array}
         * @desc 生成slider的数据
         */
        datas: null,

        /**
         * @private
         * @property slider
         * @type {Object}
         */
        slider: null,

        /**
         * @private
         * @property hasButton
         * @type {Boolean}
         * @desc 生成slider用的参数
         */
        hasButton: false,

        /**
         * @private
         * @property hasGizmos
         * @type {Boolean}
         * @desc 生成slider用的参数
         */
        hasGizmos: false,

        /**
         * @private
         * @property hasTitle
         * @type {Boolean}
         * @desc 生成slider用的参数
         */
        hasTitle: false,

        /**
         * @private
         * @constructor
         */
        initialize: function() {
            o.Widget.Mask.prototype.initialize.apply(this, arguments);
            this.imgs = this.imgs || [];
            this.datas = this.datas || [];
            if(this.imgEl) {
                this.initImgEvent();
            }
            this.animation = "fade";
            var that = this;
            o.event.on(window, "ortchange", function() {
                if(!that.isResize) {
                    o.util.requestAnimation(o.util.bind(that.checkSize, that));
                    that.isResize = true;
                }
            }, false);
            this.buildSlider();
        },

        /**
         * @private
         * @method checkSize
         * @desc 用于浏览器resize时对于屏幕宽高的重新获取
         */
        checkSize: function() {
            this.maxW = o.dom.getScreenWidth();
            this.maxH = o.dom.getScreenHeight() - 60;
            this.slider.el.style.height = this.maxH + "px";
            this.calcRect(o.one("img", this.imgCEl));
            this.isResize = false;
        },

        /**
         * @private
         * @method buildSlider
         * @desc 生成节点
         */
        buildSlider: function() {
            this.sliderEl = o.dom.createDom("div", {
                "class": "octopusui-reader-slidercontainer"
            });
            this.imgCEl = o.dom.createDom("div", {
                "class": "octopusui-reader-imgcontainer"
            });
            var fragment = document.createDocumentFragment(),
                imgdom = o.dom.createDom("img", {
                    "class": "octopusui-reader-img"
                }),
                closedom = o.dom.createDom("div", {
                    "class": "octopusui-reader-close"
                });
            this.imgCEl.appendChild(imgdom);
            fragment.appendChild(this.imgCEl);
            fragment.appendChild(closedom);
            this.sliderEl.appendChild(fragment);
            this.el.appendChild(this.sliderEl);
        },

        /**
         * @private
         * @method initImgEvent
         */
        initImgEvent: function() {
            var imgs = o.$("img", this.imgEl);
            if(!imgs)   return;
            o.util.each(this.imgs, o.util.bind(this.addImgEvent, this));
            o.util.each(imgs, o.util.bind(this.addImgEvent, this));
            this.slider = new o.Widget.Slider({
                data: this.datas,
                hasButton: this.hasButton,
                autoPlay: false,
                loop: false,
                hasGizmos: this.hasGizmos,
                hasTitle: this.hasTitle,
                loadImageNumber: 1,
                isDisableA: true,
                disScroll: true,
                id: "octopusui-reader-slider"
            });
        },

        /**
         * @private
         * @method addImgEvent
         * @param item
         * @param index
         */
        addImgEvent: function(item, index) {
            if(!o.util.isNode(item) || !item.src)    return;
            this.imgs.push(item);
            var that = this,
                src = item.src;
            o.util.loadImage(src, function() {
                o.dom.data(item, {
                    "octopusui-reader-width": this.width,
                    "octopusui-reader-height": this.height,
                    "octopusui-reader-index": index
                });
            }, function() {
                that.gesture(item).on("tap", o.util.bind(that.itemOnTap, that));
            }, o.util.empty);
            var data = {
                title: o.dom.data(item, "octopusui-reader-title") || "",
                url: o.dom.data(item, "octopusui-reader-url") || "",
                image_url: o.dom.data(item, "octopusui-reader-src") || src
            };
            this.datas.push(data);
        },

        /**
         * @private
         * @method itemOnTap
         */
        itemOnTap: function(e) {
            o.event.stop(e);
            var target = e.target;
            this.active ? this.show(target) : this.render(this.container || document.body, false, target);
        },

        /**
         * @public
         * @method octopus.Widget.PicReader.render
         */
        render: function(container, clone, dom) {
            this.slider.container = this.sliderEl;
            this.slider.el.style.visibility = "hidden";
            this.slider.isShow = false;
            this.sliderEl.appendChild(this.slider.el);

            o.Widget.prototype.render.apply(this, arguments);
            this.maxW = this.maxW || o.dom.getScreenWidth();
            this.maxH = this.maxH || o.dom.getScreenHeight() - 60;
            this.slider.activate();
            this.slider.el.style.cssText = "height: " + this.maxH + "px; width: 100%; overflow: hidden; " +
                "display: none; left: 0; top: 0; bottom: 0; right: 0; margin: auto; position: absolute;";
            this.domEmerged(dom);
        },

        /**
         * @public
         * @method octopus.Widget.PicReader.show
         */
        show: function(dom) {
            o.Widget.Mask.prototype.show.apply(this, arguments);
            if(!dom)    return;
            this.domEmerged(dom);
        },

        /**
         * @private
         * @method _hidden
         */
        _hidden: function() {
            o.Widget.Mask.prototype._hidden.apply(this, arguments);
            this.imgCEl.style.display = "block";
            this.slider.hidden();
        },

        /**
         * @private
         * @method domEmerged
         */
        domEmerged: function(dom) {
            var clonedom = dom.cloneNode(),
                _clone = o.dom.cloneNode(this.imgCEl, true, true);
            _clone.appendChild(clonedom);
            this.sliderEl.replaceChild(_clone, this.imgCEl);
            this.imgCEl = _clone;
            this.calcRect(dom);
        },

        /**
         * @private
         * @method loadLargeImg
         */
        loadLargeImg: function(el) {
            var src = o.dom.data(el, "octopusui-reader-src"),
                that = this;
            if(!src || o.dom.data(el, "octopusui-reader-loaded")) {
                this.changedVisible();
            } else {
                if(!o.dom.hasClass(this.imgCEl, "octopusui-reader-loading")) {
                    o.dom.addClass(this.imgCEl, "octopusui-reader-loading");
                }
                o.util.loadImage(o.dom.data(el, "octopusui-reader-src"), o.util.empty, function() {
                    that.changedVisible(el);
                }, function() {
                    that.changedVisible(el);
                });
            }
        },

        /**
         * @private
         * @method changedVisible
         */
        changedVisible: function() {
            if(o.dom.hasClass(this.imgCEl, "octopusui-reader-loading")) {
                o.dom.removeClass(this.imgCEl, "octopusui-reader-loading");
            }
            if(arguments[0]) {
                o.dom.data(arguments[0], {
                    "octopusui-reader-loaded": "true"
                });
            }
            this.slider.show();
            this.imgCEl.style.display = "none";
        },

        /**
         * @private
         * @property calcScreen
         */
        calcRect: function() {
            var el = arguments[0],
                rect = el.getBoundingClientRect(),
                rw = rect.width,
                rh = rect.height,
                w = o.dom.data(el, "octopusui-reader-width") || rw,
                h = o.dom.data(el, "octopusui-reader-height") || rh,
                t = rect.top,
                l = rect.left,
                maxW = this.maxW,
                maxH = this.maxH,
                _w,
                _h,
                _t,
                _l;
            if(w <= maxW && h <= maxH) {
                _t = (maxH - h) / 2 + 30;
                _l = (maxW - w) / 2;
                _w = w;
                _h = h;
            } else {
                if(w > h) {
                    _w = maxW;
                    _l = 0;
                    _h = h * _w / w;
                    _t = (maxH - _h) / 2 + 30;
                } else {
                    _h = maxH;
                    _t = 30;
                    _w = w * _h / h;
                    _l = (maxW - _w) / 2;
                }
            }
            this.slider.select(o.dom.data(el, "octopusui-reader-index") - 0);

            this.sliderAnimate(["left", "top", "width", "height"], [l, t, rw, rh], [_l, _t, _w, _h], el);
        },

        /**
         * @private
         * @method sliderAnimate
         */
        sliderAnimate: function(props, svs, evs, el) {
            var that = this;
            return new o.Tween(this.imgCEl, props, svs, evs, .4, function() {
                that.loadLargeImg(el);
            }, {
                ease: "ease-out",
                delay: .4
            });
        },

        CLASS_NAME: "octopus.Widget.PicReader"
    });

})(octopus);/**
 * @file
 * @author oupeng-fe
 * @version 1.1
 * webapp通用组件
 * progress   -   图片预览
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/dom.js
 * @require lib/event.js
 * @require widget/widget.js
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @class octopus.Widget.Progress
     * @parent octopus.Widget
     * @param options {Object}
     * @param options.duration {Number} loading动画的执行时间 在调用goTo等方法时可通过传入参数改变 默认2s
     * @type {*|Function|new}
     */
    o.Widget.Progress = o.define(o.Widget, {

        /**
         * @private
         * @property value
         * @type {Number}
         * @desc 记录的节点的translate值
         */
        value: 100,

        /**
         * @private
         * @const
         * @property speed
         * @type {Number}
         * @desc 自动加载状态下的常量参数 其实与速度无关
         */
        speed: 0.49,

        /**
         * @private
         * @const
         * @property minV
         * @type {Number}
         * @desc 自动加载状态下变化量的最小值
         */
        minV: 0.60009,

        /**
         * @private
         * @property duration
         * @type {Number}
         * @desc loading动画的执行时间
         */
        duration: 2,

        /**
         * @private
         * @property timer
         * @type {Number}
         * @desc 执行的定时器
         */
        timer: null,

        /**
         * @private
         * @const
         * @property tricker
         * @type {Number}
         * @desc 自动加载状态下的浮动变量
         */
        tricker: 100.0,

        /**
         * @private
         * @property isStop
         * @type {Boolean}
         * @desc 标志位标志当前是否处于自动加载状态
         */
        isStop: true,

        /**
         * @private
         * @property trickeTimer
         * @type {Number}
         * @desc 自动加载的定时器
         */
        trickeTimer: null,

        /**
         * @private
         * @constructor
         */
        initialize: function() {
            o.Widget.prototype.initialize.apply(this, arguments);
            o.dom.addClass(this.el, "octopusui-progress");
        },

        /**
         * @private
         * @method activate
         * @desc 将没有position属性的节点改为relative
         */
        activate: function() {
            o.Widget.prototype.activate.apply(this, arguments);
            if(o.dom.getStyle(this.container, "position") == "static") {
                this.container.style.position = "relative";
            }
        },

        /**
         * @public
         * @method octopus.Widget.Progress.goTo
         * @param opvs 参数
         * @param opvs.value {Number} 设置load的位置 取值范围为0-100
         * @param opvs.duration {Number} 设置loading动画的时间 默认为2
         * @param opvs.type {String} 设置load位置是否使用动画 默认不使用 若需要使用动画 请设置为 "animation"
         * @param opvs.func {Function} 设置完的回调函数 请注意不要再回调中使用goTo、passTrick等方法 否则回造成自引用
         * @desc 设置load行为
         */
        goTo: function(opvs) {
            if(!this.isStop) {
                this.stop();
            }
            this._goTo(opvs);
        },

        /**
         * @private
         * @method _goTo
         * @param opvs {Object}
         */
        _goTo: function(opvs) {
            var v = Math.max(Math.min(100 - Math.abs(opvs.value), 100), 0),
                d = opvs.duration || this.duration,
                t = opvs.type || "auto",
                value = "translate3d(-" + String(v) + "%, 0, 0)",
                func = opvs.func;
            if(t == "auto") {
                this.setStyle(value);
                func && func();
            } else {
                var t = " " + d + "s linear",
                    that = this;
                this.el.style.webkitTransition = "-webkit-transform" + t;
                this.el.style.transition = "transform" + t;
                window.setTimeout(function() {
                    that.setStyle(value);
                    if(that.timer) {
                        window.clearTimeout(that.timer);
                        that.timer = null;
                    }
                    var self = that;
                    that.timer = window.setTimeout(function() {
                        self.el.style.webkitTransition = "";
                        self.el.style.transition = "";
                        func && func();
                    }, d * 1000 + 150);
                }, 100);    //当页面动画非常多的时候 这个时候给一个0ms的延时对于控件自身的动画显得杯水车薪
            }
            this.setV(v);
        },

        /**
         * @private
         * @method setStyle
         * @param v {String}
         * @desc 设置el的transform值
         */
        setStyle: function(v) {
            o.dom.setStyles(this.el, {
                "-webkit-transform": v,
                "transform": v
            });
        },

        /**
         * @public
         * @method octopus.Widget.Progress.stop
         * @desc 停止自动加载方法
         */
        stop: function() {
            if(this.trickeTimer) {
                window.clearTimeout(this.trickeTimer);
                this.trickeTimer = null;
            }
        },

        /**
         * @private
         * @method setV
         * @param v
         * @desc 设置当前的value值
         */
        setV: function(v) {
            if(this.value == v) return;
            this.value = v;
        },

        /**
         * @public
         * @method octopus.Widget.Progress.passAll
         * @desc 用偷懒的方法无限接近于加载成功
         */
        passTrick: function() {
            this.isStop = false;
            if(!arguments[0]) {
                this.tricker = 100 * this.speed;
                this.value = 100;
                this.el.style.webkitTransition = "";
                this.el.style.transition = "";
                this.setStyle("translate3d(-100%, 0, 0)");
                var that = this;
                window.setTimeout(function() {
                    that._goTo({
                        value: that.tricker,
                        type: "animation"
                    });
                }, 0);
            }
            this.stop();
            this.trickeTimer = window.setTimeout(o.util.bind(this.executeTricker, this), this.duration * 1000 + 100);
        },

        /**
         * @private
         * @method executeTricker
         * @desc 具体执行自动加载的方法
         */
        executeTricker: function() {
            this.tricker = this.tricker * this.speed;
            if(this.tricker < this.minV) {
                this.isStop = true;
                this.stop();
                return;
            }
            this._goTo({
                value: 100 - this.value + this.tricker,
                type: "animation"
            });
            this.passTrick(true);
        },

        CLASS_NAME: "octopus.Widget.Progress"
    });

})(octopus);
/**
 * @file
 * @author oupeng-fe
 * @version 1.1
 * webapp通用组件
 * refresh   -   上拉下拉刷新
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/dom.js
 * @require lib/event.js
 * @require widget/widget.js
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @class octopus.Widget.Refresh
     * @parent octopus.Widget
     * @desc 上拉下拉刷新
     * @param options {Object} 接受的参数
     * @param options.direction {String} 表明是上拉|下拉刷新控件 "up"|"down" 默认是上拉刷新控件
     * @param options.height {Number} 控件的高度
     * @param options.maxTranslate {Number} 控件可以拉动的最大长度 默认为100 由于为了避免麻烦的多次处理 下拉刷新的最大高度为此值与控件高度的差值
     * @param options.halfTranslate {Number} 松手加载的临界值
     * @param options.pullText {String} 显示主区域的文字
     * @param options.changePullText {String} 显示主区域在临界值的文字
     * @param options.statusText {String} 显示次区域的文字
     * @param options.changeStatusText {String} 显示次区域在临界值的文字
     * @param options.loadText {String} 加载中的文字
     */
    o.Widget.Refresh = o.define(o.Widget, {

        /**
         * @private
         * @property direction
         * @type {String}
         * @desc 刷新的朝向 默认向上刷新
         */
        direction: "up",

        /**
         * @private
         * @property dragDirection
         * @type {String}
         * @desc 当前拖拽的方向
         */
        dragDirection: null,

        /**
         * @private
         * @property timer
         * @type {Function}
         * @desc 当touch时跑的定时期程序
         */
        timer: null,

        /**
         * @private
         * @property isDrag
         * @type {Boolean}
         * @desc 标志位 标志是否处于拖拽状态
         */
        isDrag: false,

        /**
         * @private
         * @property pageDragC
         * @type {Number}
         * @desc 拖拽点的y坐标
         */
        pageDragStartC: 0,

        /**
         * @private
         * @property pageDragDown
         * @type {Number}
         * @desc 拖拽结束点的y坐标
         */
        pageDragEndC: 0,

        /**
         * @private
         * @property pageDragTempC
         * @type {Number}
         * @desc 中间拖拽点的y坐标
         */
        pageDragTempC: 0,

        /**
         * @private
         * @property height
         * @type {Number}
         * @desc 控件高度
         */
        height: null,

        /**
         * @private
         * @property maxTranslate
         * @type {Number}
         * @desc 控件的最大拖动距离
         */
        maxTranslate: 100,

        /**
         * @private
         * @property halfTranslate
         * @type {Number}
         * @desc 控件的临界距离
         */
        halfTranslate: 30,

        /**
         * @private
         * @property arrow
         * @desc 箭头的节点
         * @type {DOMElement}
         */
        arrow: null,

        /**
         * @private
         * @property pullTextDom
         * @desc 主显示区节点
         * @type {DOMElement}
         */
        pullTextDom: null,

        /**
         * @private
         * @property pullText
         * @desc 主显示区文字
         * @type {String}
         */
        pullText: null,

        /**
         * @private
         * @property changePullText
         * @desc 临界时主显示区文字
         * @type {String}
         */
        changePullText: null,

        /**
         * @private
         * @property statusTextDom
         * @desc 状态区文字节点
         * @type {DOMElement}
         */
        statusTextDom: null,

        /**
         * @private
         * @property loadingDom
         * @desc loading节点
         * @type {DOMElement}
         */
        loadingDom: null,

        /**
         * @private
         * @property statusText
         * @desc 状态区文字
         * @type {String}
         */
        statusText: null,

        /**
         * @private
         * @property loadText
         * @desc 加载时的文字
         */
        loadText: null,

        /**
         * @private
         * @property changeStatusText
         * @type {String}
         * @desc 临界时状态区文字
         */
        changeStatusText: null,

        /**
         * @private
         * @property translateV
         * @type {Number}
         * @desc 当前节点的translate值
         */
        translateV: 0,

        /**
         * @private
         * @property isLocked
         * @desc 锁定标志位
         */
        isLocked: false,

        /**
         * @private
         * @constructor
         */
        initialize: function() {
            o.Widget.prototype.initialize.apply(this, arguments);
            o.dom.attr(this.el, {
                "class": "octopusui-refresh octopusui-refresh" + o.util.camelize(this.direction)
            });
            this.buildSelf();
        },

        /**
         * @private
         * @method updateTranslateV
         * @desc 更新当前的translate值
         */
        updateTranslateV: function(v) {
            if(this.translateV == v)    return;
            this.translateV = v;
        },

        /**
         * @private
         * @method buildSelf
         * @desc 初始化自身节点
         */
        buildSelf: function() {
            var dr = this.direction,
                config = o.Widget.Refresh.config;
            this.arrow = o.dom.createDom("div", {
                "class": config[dr]["arrowC"]
            });
            var textDom = o.dom.createDom("div", {
                    "class": "octopusui-refresh-textcontainer"
                }),
                tcontainer = o.dom.createDom("div", {
                    "class": "octopusui-refresh-refreshcontainer"
                });
            this.pullTextDom = o.dom.createDom("div", {
                "class": "octopusui-refresh-pulltext octopusui-text-limit"
            });
            this.statusTextDom = o.dom.createDom("div",  {
                "class": "octopusui-refresh-statustext octopusui-text-limit"
            })
            this.loadingDom = o.dom.createDom("div", {
                "class": "octopusui-refresh-loading"
            });
            this.updateText("pullText", "statusText");
            textDom.appendChild(this.pullTextDom);
            textDom.appendChild(this.statusTextDom);
            tcontainer.appendChild(this.arrow);
            tcontainer.appendChild(this.loadingDom);
            tcontainer.appendChild(textDom);
            this.el.appendChild(tcontainer);
        },

        /**
         * @private
         * @method toggleLoading
         */
        toggleLoading: function(exist) {
            if(!exist && this.loadingDom.style.display != "none") {
                this.loadingDom.style.display = "none";
            } else if(exist && this.loadingDom.style.display != "block") {
                this.loadingDom.style.display = "block";
            }
        },

        /**
         * @public
         * @method octopus.Widget.Refresh.render
         */
        render: function() {
            o.Widget.prototype.render.apply(this, arguments);
            if(this.height == null) {
                this.height = o.dom.getHeight(this.el);
            }
			this.addEvent();
            o.dom.scrollLite(this.container.parentNode, false);
        },

        /**
         * @private
         * @method appendChild
         * @param el
         * @param container
         * @desc 复写父类的appendChild 增加插入最前的处理
         */
        appendChild: function(el, container) {
            if(this.direction == "up") {
                container.appendChild(el);
            } else {
                o.dom.insertFirst(el, container);
            }
        },

        /**
         * @private
         * @method addEvent
         * @desc 事件监听
         */
        addEvent: function() {
            o.event.on(document, "touchstart", o.util.bindAsEventListener(this.onTouchStart, this), false);
            o.event.on(document, "touchend", o.util.bindAsEventListener(this.onTouchEnd, this), false);
            o.event.on(document, "touchcancel", o.util.bindAsEventListener(this.onTouchEnd, this), false);
            o.event.on(document, "touchmove", o.util.bindAsEventListener(this.onTouchMove, this), false);
        },

        /**
         * @private
         * @method onTouchStart
         * @desc 监听touchstart事件
         */
        onTouchStart: function(e) {
            o.event.stop(e, true);
            var that = this;
            var touches = e.touches;
            if(!touches || touches.length > 1)  return;
            this.isDrag = true;
            var touch = touches[0],
                dc = touch.pageY;
            this.pageDragStartC = this.pageDragTempC = dc;
            this.timer = function() {
                if(!that.timer) return;
                if(that.pageDragTempC > that.pageDragStartC) {
                    that.dragDirection = "down";
                } else if(that.pageDragTempC < that.pageDragStartC) {
					that.dragDirection = "up";
                }
                if((that.pageDragTempC == that.pageDragStartC) || !that.adjustScrollBar()) {
                    that.pageDragStartC = that.pageDragTempC
                    o.util.requestAnimation(that.timer);
                    return;
				}
                that.pageDragEndC = that.pageDragTempC;
                var dis = (that.pageDragTempC - that.pageDragStartC);
                that.pageDragStartC = that.pageDragTempC;
                var tvalue = that.translateV;
                var v,
                    _v = tvalue + dis;
                if(that.direction == "up") {
                    if(that.dragDirection == "up" && that.isLocked) {
                        o.util.requestAnimation(that.timer);
                        return;
                    }
                    if(_v < (0 - that.maxTranslate)) {
                        v = (0 - that.maxTranslate);
                    } else if(_v > 0) {
                        v = 0
                    } else {
                        v = _v;
                    }
                    if(v < (0 - that.halfTranslate)) {
                        that.toggleStyle(true);
                    } else {
                        that.toggleStyle(false);
                    }
                } else {
                    if(that.dragDirection == "down" && that.isLocked) {
                        o.util.requestAnimation(that.timer);
                        return;
                    }
                    if(_v > that.maxTranslate) {
                        v = that.maxTranslate;
                    } else if(_v < 0) {
                        v = 0;
                    } else {
                        v = _v;
                    }
                    if(v > (that.halfTranslate + that.height)) {
                        that.toggleStyle(true);
                    } else {
                        that.toggleStyle(false);
                    }
                }
                that.updateTranslateV(v);
                var nvalue = "translate3d(0, " + v + "px" + ", 0)";
                that.container.style.webkitTransform = nvalue;
                o.util.requestAnimation(that.timer);
            };
            o.util.requestAnimation(this.timer);
        },

        /**
         * @private
         * @method toggleStyle
         * @param change {Boolean}
         * @desc 修改显示区的内容
         */
        toggleStyle: function(change) {
            if(change && !o.dom.hasClass(this.el, "octopusui-refresh-changed")) {
                o.dom.addClass(this.el, "octopusui-refresh-changed");
                this.updateText("changePullText", "changeStatusText");
            } else if(!change && o.dom.hasClass(this.el, "octopusui-refresh-changed")) {
                o.dom.removeClass(this.el, "octopusui-refresh-changed");
                this.updateText("pullText", "statusText");
                if(this.arrow.style.display == "none") {
                    this.arrow.style.display = "block";
                }
            }
        },

        /**
         * @private
         * @method onTouchMove
         * @param e
         */
        onTouchMove: function(e) {
            var touches = e.touches;
            if(!this.isDrag || !touches || touches.length > 1)    return;
            var touch = touches[0];
			if(this.pageDragTempC == touch.pageY)	return;
			this.pageDragTempC = touch.pageY;
        },

        /**
         * @private
         * @method onTouchEnd
         */
        onTouchEnd: function(e) {
            this.isDrag = false;
            if(this.timer) {
                this.timer = null;
            }
            if(this.direction == "up") {
                if(this.translateV < (0 - this.halfTranslate)) {
                    this.loadMore();
                } else if(!this.isLocked) {
                    this.rePosition();
                }
            } else {
                if(this.translateV > (this.halfTranslate + this.height)) {
                    this.loadMore();
                } else if(!this.isLocked) {
                    this.rePosition();
                }
            }
        },

        /**
         * @private
         * @method loadMore
         */
        loadMore: function() {
            this.isLocked = true;
            var startV = "translate3d(0, " + this.translateV + "px, 0)",
                endV,
                v;
            if(this.direction == "up") {
                endV = "translate3d(0, 0px, 0)";
                v = 0;
            } else {
                endV = "translate3d(0, " + this.height + "px, 0)";
                v = this.height;
                var dom = document.createElement("div");
                document.body.appendChild(dom);
            }
            if(startV == endV)  return;
            var that = this;
            var listTween = new o.Tween(this.container, "-webkit-transform", startV,
                endV, 0.3, function() {
                    that.updateTranslateV(v);
                    that.updateText("loadText");
                    that.arrow.style.display = "none";
                    that.toggleLoading(true);
					that.notify("refresh-ui-loadmore");
                    if(dom) {
                        document.body.removeChild(dom);
                    }
                }, { ease: "ease-in-out" });
        },

        /**
         * @private
         * @method updateText
         * @param pt {String}
         * @param st {String}
         */
        updateText: function(pt, st) {
            var dr = this.direction,
                config = o.Widget.Refresh.config;
            this.pullTextDom.innerHTML = o.util.encodeHtml(this[pt] || config[dr][pt] || config[pt]);
            if(st) {
                this.statusTextDom.innerHTML = o.util.encodeHtml(this[st] || config[st]);
            } else {
                this.statusTextDom.innerHTML = "";
            }
        },

        /**
         * @private
         * @method rePosition
         */
        rePosition: function() {
            this.isLocked = false;
            var startV = "translate3d(0, " + this.translateV + "px, 0)",
                endV = "translate3d(0, 0px, 0)",
                v = 0;
            this.updateTranslateV(v);
            this.updateText("pullText", "statusText");
            this.toggleStyle(false);
            this.toggleLoading(false);
            if(startV == endV)  return;
            var fn = o.util.empty;
            if(this.direction == "down") {
                var dom = document.createElement("div");
                document.body.appendChild(dom);
                fn = function() {
                    document.body.removeChild(dom);
                }
            }
            var that = this;
            var listTween = new o.Tween(this.container, "-webkit-transform", startV,
                endV, 0.3, fn, { ease: "ease-in-out" });

        },

        /**
         * @private
         * @method adjustHasScrollBar
         * @returns {boolean}
         */
        adjustScrollBar: function() {
            var translate = this.translateV,
                body = document.body,
                scrollHeight = body.scrollHeight,
                height = body.offsetHeight,
                top = body.scrollTop,
                _height = height + top;
            return (Math.abs(translate) <= this.maxTranslate &&
                (this.direction == "up" && (_height + 5) >= scrollHeight) ||
                (this.direction == "down" && top == 0));
        },

        CLASS_NAME: "octopus.Widget.Refresh"
    });

    octopus.Widget.Refresh.config = {
        "up": {
            arrowC: "octopusui-refresh-arrowup",
            pullText: "上拉可以加载更多"
        },
        "down": {
            arrowC: "octopusui-refresh-arrowdown",
            pullText: "下拉可以加载更多"
        },
        statusText: "上次更新时间：",
        changePullText: "松手可以加载更多",
        changeStatusText: "",
        loadText: "加载中..."
    };

})(octopus);
/**
 * @file
 * @author oupeng-fe
 * @version 1.1
 * webapp通用组件
 * sidebar   -   四侧隐藏的面板
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/dom.js
 * @require lib/event.js
 * @require lib/tween.js
 * @require lib/animate.js
 * @require widget/widget.js
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @class octopus.Widget.Sidebar
     * @parent octopus.Widget
     * @desc 用于在指定容器四侧的面板
     * @param options {Object} 传入的参数
     * @param options.type {String} 默认的展现的类型 可选值包括 cover | push | reveal | rotate 其中rotate在低版本系统上work的不好
     * @param options.nextDom {DOMElement} 与之并列的节点 即可视区域显示的区域节点 如果类型为reveal则此参数不可空缺
     * @param options.position {String} 控件贴边的位置 可选值包括 left | right | top | bottom 默认为left 一经设置不可更改
     * @param options.width {Number} 控件的宽度 可传数字 单位像素 亦可传字符串形式的可替代宽度的表达 如100% 默认为100%
     * @param options.height {Number} 同高度
     * @param options.innerHTML {String} 可以传入的控件的html内容
     */
    o.Widget.Sidebar = o.define(o.Widget, {

        /**
         * @private
         * @property type
         * @type {String}
         * @desc 展现的类型
         */
        type: "cover",

        /**
         * @private
         * @property nextDom
         * @type {DOMElement}
         * @desc 某些类型需要传入并列显示的节点
         */
        nextDom: null,

        /**
         * @private
         * @property position
         * @type {String}
         * @desc 控件贴边的方位
         */
        position: "left",

        /**
         * @private
         * @property width
         * @type {String}
         * @desc 容器的宽度 不建议修改
         */
        width: "100%",

        /**
         * @private
         * @property height
         * @type {String}
         * @desc 容器的高度
         */
        height: "100%",

        /**
         * @private
         * @property styles
         * @type {Object}
         * @desc 用来存取一些初始样式的键值对
         */
        styles: null,

        /**
         * @private
         * @property innerHTML
         * @type {String}
         * @desc 控件的内容 当控件构成简单时可以直接传入 复杂时建议继承此控件开发
         */
        innerHTML: null,

        /**
         * @private
         * @property isResize
         * @type {Boolean}
         * @desc 标志位 用以resize
         */
        isResize: false,

        /**
         * @private
         * @property locked
         * @type {Boolean}
         */
        locked: false,

        /**
         * @private
         * @constructor
         */
        initialize: function() {
            o.Widget.prototype.initialize.apply(this, arguments);
            if(this.innerHTML) {
                this.el.innerHTML = this.innerHTML;
            }
            this.styles = {
                cssText: {
                    left: "left: 0px; top: 0px;",
                    right: "right: 0px; top: 0px;",
                    top: "left: 0px; top: 0px;",
                    bottom: "left: 0px; bottom: 0px;"
                },
                transform: {
                    left: "translate3d(-100%, 0, 0)",
                    right: "translate3d(100%, 0, 0)",
                    top: "translate3d(0, -100%, 0)",
                    bottom: "translate3d(0, 100%, 0)"
                }
            };
            if(o.util.isNumeric(this.width)) {
                this.width += "px";
            }
            if(o.util.isNumeric(this.height)) {
                this.height += "px";
            }
            this.el.style.cssText = this.styles.cssText[this.position] + " width: " + this.width + "; height: " + this.height +
                "; -webkit-transform-style: preserve-3d; transform-style: preserve-3d;";
            o.dom.addClass(this.el, "octopusui-sidebar");
            var that = this;
            o.event.on(window, "ortchange", function() {
                if(!that.isResize) {
                    o.util.requestAnimation(o.util.bind(that.checkSize, that));
                    that.isResize = true;
                }
            }, false);

        },

        /**
         * @private
         * @method checkSize
         * @desc 用以监听resize事件的处理
         */
        checkSize: function() {
            this.calcSelfSize();
            this.isResize = false;
        },

        /**
         * @public
         * @method octopus.Widget.Sidebar.show
         * @param type {String} 可以选择何种模式让控件显示出来
         */
        show: function(type) {
            if(this.isShow) return;
            if(this.type != type) {
                this.type = type;
                this.serialCSS();
            }
            this.el.style.display = "block";
            this.calcSelfSize();
            this["animate" + this.type.charAt(0).toUpperCase() + this.type.substring(1)](true);
        },

        /**
         * @public
         * @method octopus.Widget.Sidebar.hidden
         * @desc 隐藏控件
         */
        hidden: function() {
            if(!this.isShow)    return;
            this["animate" + this.type.charAt(0).toUpperCase() + this.type.substring(1)](false);
        },


        /**
         * @private
         * @method animate
         * @desc 几个简单动画的共有部分
         * @param svs {String} 动画的开始值
         * @param evs {String} 动画的结束值
         * @param t {Boolean} 标志着此动画是显示/隐藏时调用
         * @param el {DOMElement} 执行动画的节点
         * @returns {o.Tween}
         */
        animate: function(svs, evs, t, el) {
            var that = this;
            var pn = this.container.parentNode || this.container;
            pn.style.overflow = "hidden";
            this.locked = true;
            return new o.Tween(el, ["-webkit-transform"], [svs], [evs], .3, function() {
                that.isShow = t;
                if(t && (that.position == "right" || that.position == "bottom")) {
                    var dom = o.dom.createDom("div");
                    that.container.appendChild(dom);
                    var me = that;
                    setTimeout(function() {
                        me.container.removeChild(dom);
                        dom = null;
                    }, 0);
                } else if(!t) {
                    that.el.style.display = "none";
                }
                pn.style.overflow = "";
                that.locked = false;
            });
        },

        /**
         * @private
         * @method animateRotate
         * @param t
         */
        animateRotate: function(t) {
            var svoptions = {
                    "left": "translate3d(-100%, 0, 0) rotateY(-90deg)",
                    "right": "translate3d(100%, 0, 0) rotateY(90deg)",
                    "top": "translate3d(0, -100%, 0) rotateX(120deg)",
                    "bottom": "translate3d(0, 100%, 0) rotateX(-120deg)"
                },
                evs = "translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)",
                svs = t ? svoptions[this.position] : evs;
            if(!t) {
                evs = svoptions[this.position];
            }
            var or = {
                left: "100% 50%",
                right: "0% 50%",
                top: "50% 100%",
                bottom: "50% 0%"
            }
            this.el.style.webkitTransformOrigin = or[this.position];
            this.animateReveal(t);
            this.animate(svs, evs, t, this.el);
        },

        /**
         * @private
         * @method animateCover
         * @desc type为cover时的动画
         * @param t {Boolean} 标志位 标志显示或隐藏
         */
        animateCover: function(t) {
            var svoptions = {
                    "left": "translate3d(-100%, 0, 0)",
                    "right": "translate3d(100%, 0, 0)",
                    "top": "translate3d(0, -100%, 0)",
                    "bottom": "translate3d(0, 100%, 0)"
                },
                evs = "translate3d(0, 0, 0)",
                svs = t ? svoptions[this.position] : evs;
            if(!t) {
                evs = svoptions[this.position];
            }
            this.animate(svs, evs, t, this.el);
        },

        /**
         * @private
         * @method animatePush
         * @param t
         */
        animatePush: function(t) {
            var svoptions = {
                    "left": "translate3d(" + this.width + ", 0, 0)",
                    "right": "translate3d(-" + this.width + ", 0, 0)",
                    "top": "translate3d(0, " + this.height + ", 0)",
                    "bottom": "translate3d(0, -" + this.height + ", 0)"
                },
                svs = "translate3d(0, 0, 0)",
                evs = t ? svoptions[this.position] : svs;
            if(!t) {
                svs = svoptions[this.position];
            }
            this.animate(svs, evs, t, this.container);
        },

        /**
         * @private
         * @method animateReveal
         * @param t
         */
        animateReveal: function(t) {
            this.nextDom = o.g(this.nextDom);
            if(!this.nextDom)   throw new Error("require nextDom to reveal!");
            var svoptions = {
                    "left": "translate3d(" + this.width + ", 0, 0)",
                    "right": "translate3d(-" + this.width + ", 0, 0)",
                    "top": "translate3d(0, " + this.height + ", 0)",
                    "bottom": "translate3d(0, -" + this.height + ", 0)"
                },
                svs = "translate3d(0, 0, 0)",
                evs = t ? svoptions[this.position] : svs;
            if(!t) {
                svs = svoptions[this.position];
            }
            this.animate(svs, evs, t, this.nextDom);
        },

        /**
         * @private
         * @method serialCSS
         * @desc 用来切换不同模式下节点应包括的样式
         */
        serialCSS: function() {
            if(this.type == "cover" || this.type == "push") {
                this.el.style.webkitTransform = this.styles.transform[this.position];
                this.el.style.zIndex = 9999;
            } else {
                this.el.style.webkitTransform = "";
                this.el.style.zIndex = -1;
            }
        },

        /**
         * @private
         * @method activate
         * @desc 复写了父类的激活方法
         */
        activate: function(type) {
            o.Widget.prototype.activate.apply(this, arguments);
            var pos = o.dom.getStyle(this.container, "position");
            if(pos == "static") {
                this.container.style.position = "relative";
            }
            this.type = type || this.type;
            this.serialCSS();
        },

        /**
         * @public
         * @method octopus.Widget.Sidebar.render
         * @desc 复写了父类的render方法
         */
        render: function() {
            var len = arguments.length;
            if(len == 0) {
                this.container = this.container || document.body;
            } else {
                this.container = o.g(arguments[0]);
            }
            o.dom.addClass(this.container, "octopusui-sidebar-container");
            if(this.container.appendChild === undefined) {
                throw new Error("Illegal Dom!")
            } else {
                if(!!arguments[1]) {
                    var clonenode = o.dom.cloneNode(this.container, true);
                    this.appendChild(this.el, clonenode);
                    this.container.parentNode.replaceChild(clonenode, this.container);
                    this.container = clonenode;
                } else {
                    this.appendChild(this.el, this.container);
                }
            }
            if(!this.active) {
                this.activate(arguments[2]);
            }
            if(!this.isShow) {
                this.show(arguments[2]);
            }
        },

        /**
         * @private
         * @method calcSelfSize
         * @desc 为那些没有个具体数值宽高的控件做某些动画时获取具体的数值
         */
        calcSelfSize: function() {
            var pos = this.position,
                pro = (pos == "left" || pos == "right") ? "width" : "height";
            this[pro] = o.dom["get" + pro.charAt(0).toLocaleUpperCase() + pro.substring(1)](this.el) + "px";
        },

        CLASS_NAME: "octopus.Widget.Sidebar"
    });

})(octopus);/**
 * @file
 * @author oupeng-fe
 * @version 1.1
 * webapp通用组件
 * slider   -   轮播图
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/dom.js
 * @require lib/event.js
 * @require lib/tween.js
 * @require lib/animate.js
 * @require widget/widget.js
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @class octopus.Widget.Slider
     * @parent octopus.Widget
     * @desc 轮播图或轮播节点
     * @param options {Object} 参数
     * @param options.data {Array} 轮播图的图片数据 如果指定了children属性 则此参数失效
     * @param options.children {Array} 需要进行轮播的节点
     * @param options.width {Number} 轮播的宽度 建议初始化赋值 可以省掉一次获取宽度的repaint
     * @param options.height {Number} 轮播的高度 建议初始化赋值
     * @param options.dataField {Object} 图片模式下 数据的解析值 默认为{ title: "title", url: "url", image_url: "image_url" }
     * @param options.isLon {Boolean} 是否纵向轮播 true为纵向 否则为横向 默认false
     * @param options.isNewTab {Boolean} 当点击轮播图的行为为默认行为跳转时生效 true为新窗口打开 false在原窗口打开 默认true
     * @param options.autoPlay {Boolean} 是否生成后进行动画 默认为true
     * @param options.autoPlayTime {Number} 轮播图动画时的停留时间 单位ms 默认为4000ms
     * @param options.animationTime {Number} 轮播图单次动画运行时间 单位ms 默认为400ms
     * @param options.animationType {String} 轮播图的动化类型 默认为"ease-out"
     * @param options.loop {Boolean} 是否是循环轮播 默认为true
     * @param options.hasTitle {Boolean} 是否有轮播图下方的title区域
     * @param options.hasGizmos {Boolean} 是否有轮播图下方的选择区域
     * @param options.disScroll {Boolean} 是否阻止滚动条
     */
    o.Widget.Slider = o.define(o.Widget, {

        /**
         * @private
         * @property data
         * @type {Array}
         * @desc 控件的数据 如果非图片类型的轮播 此参数失效
         */
        data: null,

        /**
         * @private
         * @property width
         * @type {Number}
         * @desc 每页轮播的宽度
         */
        width: null,

        /**
         * @private
         * @property height
         * @type {Number}
         * @desc 每页轮播的高度
         */
        height: null,

        /**
         * @private
         * @property children
         * @type {Array | DOMElement}
         * @desc 配置的节点轮播 则图片轮播配置失效
         */
        children: null,

        /**
         * @private
         * @property doms
         * @type {Array | DOMElement}
         * @desc 轮播图中轮播节点的集合
         */
        doms: null,

        /**
         * @private
         * @property length
         * @type {Number}
         * @desc 轮播的长度
         */
        length: 0,

        /**
         * @private
         * @property _type
         * @type {String}
         * @desc 标志位 标志是图片轮播还是节点轮播 "img" || "dom"
         */
        _type: "img",

        /**
         * @private
         * @property dataFiled
         * @type {Object}
         * @desc 图片模式下数据的读取key
         */
        dataField: null,

        /**
         * @private
         * @property viewDiv
         * @type {DOMElement}
         * @desc 轮播的载体
         */
        viewDiv: null,

        /**
         * @private
         * @property isLon
         * @type {Boolean}
         * @desc 是否纵向轮播
         */
        isLon: false,

        /**
         * @private
         * @property isNewTab
         * @type {Boolean}
         * @desc 配置项 是否点击后新窗口打开
         */
        isNewTab: true,

        /**
         * @private
         * @property isDisableA
         * @type {Boolean}
         * @desc 配置项 是否自定义点击事件
         */
        isDisableA: false,

        /**
         * @private
         * @property current
         * @type {Object}
         * @desc 当前选择的节点以及index信息
         */
        current: null,

        /**
         * @private
         * @property loadImageNumber
         * @type {Number}
         * @desc 默认一次拉取的图片个数 为负数表示一次拉取完毕
         */
        loadImageNumber: 4,

        /**
         * @private
         * @property timer
         * @type {Number}
         * @desc 轮播的timer
         */
        timer: null,

        /**
         * @private
         * @property autoPlayTime
         * @desc 轮播图留的时间
         * @type {Number}
         */
        autoPlayTime: 4000,

        /**
         * @private
         * @property animationTime
         * @desc 轮播速度
         * @type {Number}
         */
        animationTime: 400,

        /**
         * @private
         * @property animationType
         * @desc 轮播图的动画类型
         */
        animationType: "ease-out",

        /**
         * @private
         * @property disableAll
         * @type {Boolean}
         */
        disableAll: false,

        /**
         * @private
         * @property disScroll
         * @type {Boolean}
         * @desc 是否停掉滚动事件
         */
        disScroll: false,

        /**
         * @private
         * @property loop
         * @type {Boolean}
         * @desc 是否循环轮播
         */
        loop: true,

        /**
         * @private
         * @property autoPlay
         * @type {Boolean}
         * @desc 是否自动播放 设置为false时，需要手动打开
         */
        autoPlay: true,

        /**
         * @private
         * @property hasButton
         * @type {Boolean}
         * @desc 是否有左右两侧的button
         */
        hasButton: true,

        /**
         * @private
         * @property hasTitle
         * @type {Boolean}
         * @desc 是否具有下侧的title区域
         */
        hasTitle: true,

        /**
         * @private
         * @property hasGizmos
         * @type {Boolean}
         * @desc 是否具有下侧的选择区域
         */
        hasGizmos: true,

        /**
         * @private
         * @property preDom
         * @type {DOMElement}
         * @desc 上一张
         */
        preDom: null,

        /**
         * @private
         * @property nextDom
         * @type {DOMElement}
         * @desc 下一张
         */
        nextDom: null,

        /**
         * @private
         * @property currentGizmos
         * @type {DOMElement}
         * @desc 当前的小玩意
         */
        currentGizmos: null,

        /**
         * @private
         * @property gizmosDoms
         * @type {Array}
         * @desc 选择器节点的数组
         */
        gizmosDoms: null,

        /**
         * @private
         * @property isSlide
         * @type {Boolean}
         * @desc 标志位 标志是否正在轮播
         */
        isSlide: false,

        /**
         * @private
         * @property isDrag
         * @type {Boolean}
         * @desc 标志位 标志是否处于拖拽状态
         */
        isDrag: false,

        /**
         * @private
         * @property isTimer
         * @type {Boolean}
         * @desc 标志位 一些手机无法使用removeEventListener去掉事件 导致transitionEnd事件绑上后无法卸载 因此使用标志位解决
         */
        isTimer: false,

        /**
         * @private
         * @property pageDragC
         * @type {Number}
         * @desc 拖拽点 横向与纵向分别对应x与y
         */
        pageDragStartC: 0,

        /**
         * @private
         * @property pageDragDown
         * @type {Number}
         * @desc 拖拽结束点
         */
        pageDragEndC: 0,

        /**
         * @private
         * @property pageDragTempC
         * @type {Number}
         * @desc 中间拖拽点
         */
        pageDragTempC: 0,

        /**
         * @private
         * @property pageDragDirection
         * @type {Boolean}
         * @desc 拖拽的方向 true为正向 false为正方向
         */
        pageDragDirection: false,

        /**
         * @private
         * @property dragtimer
         * @type {Number}
         * @desc 拖拽时的timer
         */
        dragtimer: null,

        /**
         * @private
         * @property translateValue
         * @type {Number}
         * @desc 轮播的位置
         */
        translateValue: 0,

        /**
         * @private
         * @property changeDis
         * @type {Number}
         * @desc 拖拽改变的距离
         */
        changeDis: 0,

        /**
         * @private
         * @property springBackDis
         * @type {Number}
         */
        springBackDis: 10,

        /**
         * @private
         * @property eventTimer
         */
        eventTimer: null,

        /**
         * @private
         * @property unloadImage
         */
        unloadImage: null,

        /**
         * @private
         * @property touchStartPixelX
         * @type {Number}
         */
        touchStartPixelX: null,

        /**
         * @private
         * @property touchStartPixelY
         * @type {Number}
         */
        touchStartPixelY: null,

        /**
         * @private
         * @constructor octopus.Widget.Slider.initialize
         * @desc 与父类保持一致
         */
        initialize: function() {
            o.Widget.prototype.initialize.apply(this, arguments);
            this.dataField = this.dataField || {
                title: "title",
                url: "url",
                image_url: "image_url"
            };
            this.doms = this.children || [];
            this.unloadImage = [];
            this.length = this.doms.length == 0 ? this.data.length : this.doms.length;
            this.current = {
                index: 0,
                dom: null
            };
            this.buildDoms(this.el);
            this.buildSlider();
            this.el.style.cssText = "overflow: hidden; width: 100%; height: 100%; position: relative;";
            //如果是自动渲染生成 必须传入宽度与高度 否则抛错
            if(this.autoActivate) {
                if(this.width == null || this.height == null) throw new Error("Require the Slider's width and height!");
                this.activate();
            }
        },

        /**
         * @private
         * @method buildDoms
         * @param el {DOMElement}
         */
        buildDoms: function(el) {
            this.viewDiv = this.viewDiv || o.dom.createDom("div", {
                style: "position: relative; text-align: center; -webkit-transform: translate3d(0, 0, 0);" +
                    " -webkit-backface-visibility: hidden; -webkit-user-select: none; -webkit-user-drag: none;" +
                    " -webkit-transition: -webkit-transform 0ms " + this.animationType + ";",
                "class": "octopusui-slider-view"
            });
            if(this.hasButton && !this.disableAll && this.length > 1) {
                var btnCssText = "display: block; text-decoration: none;";
                this.preDom = o.dom.createDom("div", {
                    href: "",
                    style: btnCssText,
                    "class": "octopusui-slider-button octopusui-slider-prebutton"
                });
                this.nextDom = o.dom.createDom("div", {
                    href: "",
                    style: btnCssText,
                    "class": "octopusui-slider-button octopusui-slider-nextbutton"
                });
                var that = this;
                this.gesture(this.preDom).on("tap", function(e) {
                    o.event.stop(e);
                    that._selectPre();
                    that.autoPlay && that.start();
                });
                this.gesture(this.nextDom).on("tap", function(e) {
                    o.event.stop(e);
                    that._selectNext();
                    that.autoPlay && that.start();
                });
                el.appendChild(this.preDom);
                el.appendChild(this.nextDom);
            }
            if(this.hasGizmos) {
                this.gizmosDoms = new Array(this.length);
                var len = this.length,
                    i = 0,
                    fragment = document.createDocumentFragment(),
                    rodom = o.dom.createDom("div", {
                        "class": "octopusui-slider-gizmos"
                    });
                for(; i < len; i++) {
                    var _className = "octopusui-slider-gizmositem";
                    if(i == 0) {
                        _className = "octopusui-slider-gizmositem octopusui-slider-currentgizmositem"
                    }
                    var dom = o.dom.createDom("div", {
                        "class": _className
                    });
                    this.gizmosDoms[i] = dom;
                    fragment.appendChild(dom);
                }
                this.currentGizmos = this.gizmosDoms[0];
                rodom.appendChild(fragment);
                el.appendChild(rodom);
            }
        },

        /**
         * @private
         * @method setCurrent
         * @desc 设置当强选中的轮播
         * @param options {Object}
         */
        setCurrent: function(options) {
            this.current = o.extend(this.current, options);
            if(this.currentGizmos) {
                var index = this.current.index;
                if(this.currentGizmos != this.gizmosDoms[index]) {
                    o.dom.removeClass(this.currentGizmos, "octopusui-slider-currentgizmositem");
                    this.currentGizmos = this.gizmosDoms[index];
                    o.dom.addClass(this.currentGizmos, "octopusui-slider-currentgizmositem");
                }
            }
        },

        /**
         * @private
         * @method octopus.Widget.Slider.buildSlider
         * @desc 生成初始节点结构
         */
        buildSlider: function() {
            var fragment;
            if(this.children == null) {
                fragment = this.buildDefaultSlider();
            } else {
                fragment = this.buildDomSlider();
            }
            if(this.loop && this.length > 1) {
                var fristdom = this.doms[0].cloneNode(true),
                    lastdom = this.doms[this.length - 1].cloneNode(true);
                if(this._type == "img") {
                    this.setImageLoad(0, fristdom);
                    this.setImageLoad(this.length - 1, lastdom);
                }
                fragment.appendChild(fristdom);
                fragment.appendChild(lastdom);
                this.doms.push(fristdom);
                this.doms.push(lastdom);
                this.length += 2;
            }
            this.setCurrent({
                dom: this.doms[0]
            });
            this.viewDiv.appendChild(fragment);
            this.el.appendChild(this.viewDiv);
        },

        /**
         * @private
         * @method buildSliderItem
         * @desc 生成轮播图的单例
         * @param index {Number}
         */
        buildSliderItem: function(index) {
            var dom = o.dom.createDom("div", {
                    "class": "octopusui-slider-children",
                    "style": "position: relative; -webkit-transform: translate3d(0, 0, 0); overflow: hidden;"
                }),
                idom = o.dom.createDom("img", {
                    "class": "octopusui-slider-imgChildren",
                    style: "max-width: 100%; max-height: 100%; position: absolute; left: 0; right: 0; top: 0; bottom: 0; margin: auto;"
                }),
                __url = this.getDataBy(index, "url") || "",
                __target = this.isNewTab ? "_blank" : "_self",
                that = this;
            o.event.on(idom, "click", function() {
                if(!that.isDisableA) {
                    window.open(__url, __target);
                    return;
                }
                that.notify("slider-item-ontap", that.data[index]);
            });
            if((index < Math.ceil(this.loadImageNumber / 2)) ||
                index >= Math.floor(this.length - this.loadImageNumber / 2)) {
                this.setImageLoad(index, idom);
            } else {
                this.unloadImage.push({
                    index: index,
                    dom: idom
                });
            }
            dom.appendChild(idom);
            if(this.hasTitle) {
                var titledom = o.dom.createDom("div", {
                        "class": "octopusui-slider-imgTitle"
                    }),
                    titlecontent = o.dom.createDom("div", {
                        "class": "octopusui-slider-imgTitleContent octopusui-text-limit"
                    });
                titlecontent.innerHTML = o.util.encodeHtml(this.getDataBy(index, "title"));
                titledom.appendChild(titlecontent);
                dom.appendChild(titledom);
            }
            this.doms.push(dom);
            return dom;
        },

        /**
         * @public
         * @method octopus.Widget.Slider.on
         * @desc 同Widget 值得注意的是 如果自定义监听了"slider-item-ontap"事件 默认点击轮播图打开新链接的行为将失效
         * @param type {String} 事件类型
         * @param func {Function} 事件监听函数
         */
        on: function(type, func) {
            o.Widget.prototype.on.apply(this, arguments);
            if(type == "slider-item-ontap" && !this.isDisableA) {
                this.isDisableA = true;
            }
        },

        /**
         * @private
         * @method buildDefaultSlider
         * @desc 生成图片轮播
         */
        buildDefaultSlider: function() {
            var len = this.data.length;
            if(!!!len) throw new Error("Require data of image!");
            var i = 0,
                fragment = document.createDocumentFragment();
            for(; i < len; i++) {
                var dom = this.buildSliderItem(i);
                fragment.appendChild(dom);
            }
            return fragment;
        },

        /**
         * @private
         * @method setImageLoad
         * @param index {Number} 图片的index
         * @param dom {DOMELement} 图片的载体节点
         */
        setImageLoad: function(index, dom) {
            var url = this.getDataBy(index, "image_url");
            var _dom = o.one(".octopusui-slider-imgChildren", dom) || dom;
            o.util.loadImage(url, o.util.empty, function() {
                _dom.src = url;
                o.animation.fade(_dom, {
                    out: false
                });
            }, function() {
                console.error("Image " + url + " load failed!");
            });
        },

        /**
         * @private
         * @method buildDomSlider
         * @desc 生成节点轮播
         */
        buildDomSlider: function() {
            var fragment = document.createDocumentFragment(),
                len = this.doms.length,
                i = 0;
            this._type = "dom";
            for(; i < len; i++) {
                fragment.appendChild(this.doms[i]);
            }
            return fragment;
        },

        /**
         * @public
         * @method octopus.Widget.Slider.render
         * @desc 复写父类的render方法
         */
        render: function() {
            o.Widget.prototype.render.apply(this, arguments);
            if(this.autoPlay && this.length > 1) {
                this.start();
            }
            this.notify("slider-ui-afterrender");
        },

        /**
         * @private
         * @method activate
         * @desc 轮播图生成后加入页面需要激活
         */
        activate: function() {
            o.Widget.prototype.activate.apply(this, arguments);
            this.calcSelfSize();
            if(!this.disableAll) {
                this.initSelfEvent();
            }
        },

        /**
         * @private
         * @method onOrtChanged
         */
        onOrtChanged: function() {
            this.calcSelfSize();
            this.select(this.current.index);
        },

        /**
         * @private
         * @method updateTranslateValue
         * @desc 更新轮播的位置
         * @param v {Number}
         */
        updateTranslateValue: function(v) {
            if((!v && v != 0) || this.translateValue == v)  return;
            this.translateValue = v;
        },

        /**
         * @private
         * @method calcSelfSize
         * @desc 初始化自身宽高
         */
        calcSelfSize: function() {
            this.isLon ? this.initDomsProperty("width", "height", false) : this.initDomsProperty("height", "width", true);
        },

        /**
         * @private
         * @method initDomsWidth
         * @desc 将所有dom宽度或高度设置了
         */
        initDomsProperty: function(pro, spro, isFloat) {
            var that = this,
                len = this.length;
            this.viewDiv.style[pro] = "100%";
            var _spro = o.dom["get" + spro.charAt(0).toUpperCase() + spro.substring(1)](this.el);
            this[spro]  = _spro;
            this.viewDiv.style[spro] = _spro * len + "px";
            o.util.each(this.doms, function(item, i) {
                item.style[pro] = "100%";
                item.style[spro] = _spro + "px";
				if(isFloat) {
                    item.style.float = "left";
                }
                if(i == len - 1 && that.loop && that.length > 1) {
                    var __style = that.isLon ? "top" : "left";
                    item.style[__style] = 0 - _spro * len + "px";
                }
            });
        },

        /**
         * @private
         * @method initSelfEvent
         * @desc 给轮播图绑定事件
         */
        initSelfEvent: function() {
            if(this.length > 1) {
                o.event.on(this.el, "touchstart", o.util.bindAsEventListener(this.onTouchStart, this));
                o.event.on(this.el, "touchmove", o.util.bindAsEventListener(this.onTouchMove, this));
                o.event.on(this.el, "touchend touchcancel", o.util.bindAsEventListener(this.onTouchEnd, this));
            }
            o.event.on(window, "ortchange", o.util.bind(this.onOrtChanged, this), false);
        },

        /**
         * @private
         * @method onTouchStart
         * @desc 开始拖拽
         * @param e {window.event}
         */
        onTouchStart: function(e) {
            if(this.eventTimer || this.isSlide) return;
            this.disScroll && o.event.stop(e);
            var touches = e.touches;
            if(!touches || touches.length > 1)  return;
            this.viewDiv.style.webkitTransitionDuration = "0ms";
            this.isDrag = true;
            if(this.autoPlay) {
                this.stop();
            }
            var touch = touches[0];
            var dc;
            if(this.isLon) {
                dc = touch.pageY;
            } else {
                dc = touch.pageX;
            }
            this.touchStartPixelX = touch.pageX;
            this.touchStartPixelY = touch.pageY;
            this.pageDragStartC = this.pageDragTempC = dc;
            var that = this;
            this.dragtimer = window.setInterval(function() {
                if(that.pageDragTempC == that.pageDragEndC) return;
                that.pageDragEndC = that.pageDragTempC;
                var dis = that.pageDragTempC - that.pageDragStartC;
                that.pageDragStartC = that.pageDragTempC;
                var tvalue = that.translateValue,
                    nvalue = tvalue + dis,
                    ntransform;
                if(that.isLon) {
                    ntransform = "translate3d(0, " + nvalue + "px, 0)";
                } else {
                    ntransform = "translate3d(" + nvalue + "px, 0, 0)";
                }
                that.updateTranslateValue(nvalue);
                that.changeDis += dis;
                that.viewDiv.style.webkitTransform = ntransform;
            }, 16);
        },

        /**
         * @private
         * @method onTouchMove
         * @desc 拖拽进行
         * @param e {window.event}
         */
        onTouchMove: function(e) {
            var touches = e.touches;
            if(!this.isDrag || !touches || touches.length > 1)    return;
            var touch = touches[0],
                dc;
            if(this.isLon) {
                dc = touch.pageY;
            } else {
                dc = touch.pageX;
            }
            if(this.pageDragTempC == dc)	return;
            var pixel = {
                pageX: this.touchStartPixelX,
                pageY: this.touchStartPixelY
            }
            var angle = o.util.getDirection(pixel, touch);
            this.pageDragTempC = dc;
            if(this.disScroll)  return o.event.stop(e);
            if((this.isLon && (angle == "up" || angle == "down")) ||
                (!this.isLon && (angle == "left" || angle == "right"))) {
                o.event.stop(e);
            }
        },

        /**
         * @private
         * @method onTouchEnd
         * @desc 拖拽结束
         * @param e {window.event}
         */
        onTouchEnd: function(e) {
            this.isDrag = false;
            if(this.dragtimer) {
                window.clearInterval(this.dragtimer);
                this.dragtimer = null;
            }
            var target = e.target;
            if(target == this.preDom || target == this.nextDom) return;
            if(Math.abs(this.changeDis) <= this.springBackDis) {
                this.select(this.current.index);
            } else if(this.loop) {
                if(this.changeDis < 0) {
                    this._selectNext();
                } else {
                    this._selectPre();
                }
            } else if(!this.loop) {
                if(this.changeDis < 0 && this.current.index != this.length - 1) {
                    this._selectNext();
                } else if(this.changeDis > 0 && this.current.index != 0) {
                    this._selectPre();
                } else {
                    this.select(this.current.index);
                }
            }
            this.changeDis = 0;
            if(this.autoPlay) {
                this.start();
            }
        },

        /**
         * @private
         * @method getDataBy
         * @desc 把存的数据中的某项取出来
         * @param index {Number}
         * @param pro {String}
         */
        getDataBy: function(index, pro) {
            return this.data[index][this.dataField[pro]];
        },

        /**
         * @public
         * @method octopus.Widget.Slider.start
         * @desc 开始轮播
         */
        start: function() {
            this.stop();
            this.timer = window.setTimeout(o.util.bind(this._calcCurrent, this), this.autoPlayTime);
        },

        /**
         * @private
         * @method _calcCurrent
         * @desc 进行轮播
         */
        _calcCurrent: function() {
            var index = this.current.index;
            var length = this.loop ? this.length - 2 : this.length;
            index = (++index == length) ? 0 : index;
            this.select(index, "next");
            this.start();
        },

        /**
         * @public
         * @method octopus.Widget.Slider.stop
         * @desc 停止轮播
         */
        stop: function() {
            if(this.timer) {
                window.clearTimeout(this.timer);
                this.timer = null;
            }
        },

        /**
         * @public
         * @method octopus.Widget.Slider.select
         * @desc 选择第n个子节点
         * @param index {Number}
         */
        select: function(index) {
            this.isSlide = true;
            this.viewDiv.style.webkitTransitionDuration = this.animationTime + "ms";

            if(this.loop) {
                this.selectLoop(index, arguments[1]);
            } else {
                this.selectNoLoop(index);
            }
            this.setCurrent({
                index: index,
                dom: this.doms[index]
            });
            if(this._type == "img" && this.unloadImage.length > 0) {
                var max = index + Math.ceil(this.loadImageNumber / 2),
                    min = Math.floor(this.loadImageNumber / 2),
                    _len = this.unloadImage.length,
                    i = _len;
                for(; i--; ) {
                    var _index = this.unloadImage[i].index;
                    if((_index < max) && !this.pageDragDirection ||
                        (index - _index) <= min && this.pageDragDirection) {
                        this.setImageLoad(_index, this.unloadImage[i].dom);
                        this.unloadImage.splice(i, 1);
                    }
                }
            }
            var that = this;
            window.setTimeout(function() {
                that.isSlide = false;
                that.notify("slider-ui-slidechange");
            }, this.animationTime + 50);
        },

        /**
         * @private
         * @method selectNoLoop
         * @desc 轮播到最后再轮播回来
         * @param index {Number}
         */
        selectNoLoop: function(index) {
            var translatestr = "translate3d(";
            if(this.isLon) {
                var t = 0 - (index * this.height);
                translatestr += "0, " + t + "px, 0)";
            } else {
                var t = 0 - (index * this.width);
                translatestr += t + "px, 0, 0)";
            }
            this.updateTranslateValue(t);
            this.viewDiv.style.webkitTransform = translatestr;
        },

        /**
         * @private
         * @method selectLoop
         * @desc 循环选择
         * @param index {Number}
         */
        selectLoop: function(index) {
            var _index = this.current.index,
                len = this.length - 2,
                temp,
                _temp = temp = "translate3d(";
            if((index == 0 && _index == (len - 1)) || (_index == 0 && index == (len - 1))) {
                var that = this,
                    d = arguments[1];
                if(len == 2 && d && ((index == 0 && _index == (len - 1) && d == "pre")
                    || (index == (len - 1) && _index == 0 && d == "next"))) {
                    this.selectNoLoop(index);
                    return;
                }
                if(index == 0 && _index == (len - 1)) {
                    _temp += "0, 0, 0)";
                    this.updateTranslateValue(0);
                    if(this.isLon) {
                        temp += "0, " + (0 - this.height * len) + "px, 0)";
                    } else {
                        temp += (0 - this.width * len) + "px, 0, 0)";
                    }
                } else if(index == (len - 1) && _index == 0) {
                    if(this.isLon) {
                        temp += "0, " + this.height + "px, 0)";
                        _temp += "0, " + (0 - this.height * (len - 1)) + "px, 0)";
                        this.updateTranslateValue(0 - this.height * (len - 1));
                    } else {
                        temp += this.width + "px, 0, 0)";
                        _temp += (0 - this.width * (len - 1)) + "px, 0, 0)";
                        this.updateTranslateValue(0 - this.width * (len - 1));
                    }
                }
                this.isTimer = true;
                var onChanged = function(e) {
                    o.event.un(that.viewDiv, "webkitTransitionEnd", onChanged, false);
                    if(!that.isTimer) return;
                    if(that.eventTimer) {
                        window.clearTimeout(that.eventTimer);
                        that.eventTimer = null;
                    }
                    that.viewDiv.style.webkitTransitionDuration = "0ms";
                    that.viewDiv.style.webkitTransform = _temp;
                    _temp = null;
                }
                o.event.on(this.viewDiv, "webkitTransitionEnd", onChanged, false);
                this.viewDiv.style.webkitTransform = temp;
                this.eventTimer = window.setTimeout(function() {
                    o.event.un(that.viewDiv, "webkitTransitionEnd", onChanged, false);
                    that.viewDiv.style.webkitTransitionDuration = "0ms";
                    that.viewDiv.style.webkitTransform = _temp;
                    _temp = null;
                    that.eventTimer = null;
                    that.isTimer = false;
                }, this.animationTime - 50 < 0 ? 0 : this.animationTime - 50);
            } else {
                this.selectNoLoop(index);
            }
        },

        /**
         * @public
         * @method octopus.Widget.Slider._selectPre
         * @desc 选择上一张轮播图
         */
        _selectPre: function() {
            if(this.isSlide)    return;
            var len = this.loop ? this.length - 2 : this.length;
            var index = (this.current.index - 1) < 0 ? (len - 1) : this.current.index - 1;
            this.pageDragDirection = true;
            this.select(index, "pre");
        },

        /**
         * @public
         * @method octopus.Widget.Slider._selectNext
         * @desc 选择下一张轮播图
         */
        _selectNext: function() {
            if(this.isSlide)   return;
            var len = this.loop ? this.length - 2 : this.length;
            var index = (this.current.index + 1) > (len - 1) ? 0 : this.current.index + 1;
            this.pageDragDirection = false;
            this.select(index, "next");
        },

        CLASS_NAME: "octopus.Widget.Slider"
    });

    /**
     * @method octopus.Widget.slider
     * @param el {DOMElement}
     * @returns {o.Widget.HtmlSlider}
     * @desc 生成与html模版相绑定的轮播图 所有的参数都以html模版形式传入
     */
    o.Widget.slider = function(el) {
        return new o.Widget.HtmlSlider({
            el: el
        });
    };

    /**
     * @class octopus.Widget.HtmlSlider
     * @parent octopus.Widget.Slider
     * @desc 参数与octopus.Widget.Slider相同 不同的是 这个类仅限于对已有符合规范的html模版的改造与封装
     * 符合条件的html模版属性包括
     * data-octopusui-slider-loop 如果无此属性则轮播图不前后循环
     * data-octopusui-slider-nobutton 如果设置此属性 则不包含上一个下一个按钮
     * data-octopusui-slider-disable 如果设置此属性 则除了不包含按钮外 也没有任何事件监听 可用于单张图
     * data-octopusui-slider-nogizmos 如果设置此属性 则不包含右下角的角标
     * data-octopusui-slider-notauto 如果设置此属性 则不自动触发轮播
     * data-octopusui-slider-adaptive 如果设置此属性 则轮播图以默认大小自动撑开
     * data-octopusui-slider-notitle 如果设置此属性 则不包含轮播图的title
     */
    o.Widget.HtmlSlider = o.define(o.Widget.Slider, {

        /**
         * @private
         * @property fragment
         * @type {DocumentFragment}
         * @desc 文档碎片 用来生成改造后的实际dom
         */
        fragment: null,

        /**
         * @private
         * @property adaptive
         * @type {String}
         * @desc 用来确认当前轮播图是否自动撑开
         */
        adaptive: null,

        /**
         * @private
         * @constructor
         */
        initialize: function() {
            //虽然继承自octopus.Widget.Slider 但是构造函数这里希望使用octopus.Widget的构造函数
            o.Widget.prototype.initialize.apply(this, arguments);
            this.dataField = {
                title: "title",
                url: "url"
            };
            this.container = this.el.parentNode;
            this.fragment = document.createDocumentFragment();
            this.unloadImage = [];
            this.loop = o.dom.data(this.el, "octopusui-slider-loop");
            this.hasButton = !o.dom.data(this.el, "octopusui-slider-nobutton");
            this.hasGizmos = !o.dom.data(this.el, "octopusui-slider-nogizmos");
            this.disableAll = o.dom.data(this.el, "octopusui-slider-disable");
            this.isDisableA = o.dom.data(this.el, "octopusui-slider-disabletap");
            this.autoPlay = !o.dom.data(this.el, "octopusui-slider-notauto");
            this.adaptive = o.dom.data(this.el, "octopusui-slider-adaptive");
            this.hasTitle = !o.dom.data(this.el, "octopusui-slider-notitle");
            this.disScroll = o.dom.data(this.el, "octopusui-slider-disscroll");
            this.buildSelf();
            if(!this.isShow) {
                this.show();
            }
            if(!this.active) {
                this.activate();
            }
            if(this.autoPlay && this.length > 1) {
                this.start();
            }
            this.notify("slider-ui-afterrender");
        },

        /**
         * @private
         * @method buildSelf
         * @desc 生成自身节点
         */
        buildSelf: function() {
            var children = this.el.children,
                len = children.length;
            if(len < 2) return;
            this.length = len;
            this.data = [];
            this.doms = [];
            this.fragment = document.createDocumentFragment();
            var node = this.el.cloneNode(false);
            this.buildDoms(node);
            this.buildSlider(children);
            node.appendChild(this.viewDiv);
            this.el.parentNode.replaceChild(node, this.el);
            this.el = node;
            this.el.style.cssText = "overflow: hidden; position: relative;";
        },

        /**
         * @private
         * @method buildSlider
         * @desc 生成轮播图
         */
        buildSlider: function(items) {
            o.util.each(items, o.util.bind(this.buildItem, this));
            if(this.loop && this.length > 1) {
                var fristdom = this.doms[0].cloneNode(true),
                    lastdom = this.doms[this.length - 1].cloneNode(true);
                this.doms.push(fristdom);
                this.doms.push(lastdom);
                this.fragment.appendChild(fristdom);
                this.fragment.appendChild(lastdom);
                this.length += 2;
            }
            this.setCurrent({
                dom: this.doms[0],
                index: 0
            });
            this.viewDiv.appendChild(this.fragment);
        },

        /**
         * @private
         * @method render
         * @desc 防止被调用
         */
        render: function() {
            throw new Error("this class can't render! :)");
        },

        /**
         * @private
         * @method buildItem
         * @desc 生成每张单张的轮播图
         */
        buildItem: function(item, index) {
            if(!o.util.isNode(item)) return;
            this.data.push({
                url: o.dom.data(item, "octopusui-slider-url"),
                title: o.dom.data(item, "octopusui-slider-title")
            });
            var dom = o.dom.createDom("div", {
                    "class": "octopusui-slider-children",
                    "style": "-webkit-transform: translate3d(0, 0, 0); transform: translate3d(0, 0, 0); position: relative;"
                }),
                _item = item.cloneNode(true),
                _itemcssText = "width: 100%;";
            !this.adaptive && (_itemcssText += " position: absolute; left: 0; right: 0; top: 0; bottom: 0; margin: auto;", true);
            _item.style.cssText = _itemcssText;
            dom.appendChild(_item);
            var title = this.getDataBy(index, "title");
            if(this.hasTitle && title) {
                var titledom = o.dom.createDom("div", {
                        "class": "octopusui-slider-imgTitle"
                    }),
                    titlecontent = o.dom.createDom("div", {
                        "class": "octopusui-slider-imgTitleContent octopusui-text-limit"
                    });
                titlecontent.innerHTML = o.util.encodeHtml(title);
                titledom.appendChild(titlecontent);
                dom.appendChild(titledom);
            }
            var that = this,
                __url = this.getDataBy(index, "url") || "",
                __target = this.isNewTab ? "_blank" : "_self";
            o.event.on(dom, "click", function() {
                if(!that.isDisableA) {
                    window.open(__url, __target);
                    return;
                }
                that.notify("slider-item-ontap", that.data[index]);
            });
            this.fragment.appendChild(dom);
            this.doms.push(dom);
        },

        CLASS_NAME: "octopus.Widget.HtmlSlider"
    });

})(octopus);/**
 * @file
 * webapp通用组件结构文件
 * 定义模块管理
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/dom.js
 * @require lib/event.js
 * @author oupeng-fe
 * @version 1.1
 */
;(function(o, undefined) {

    "use strict";

	/**
	 * @namespace octopus.app
	 * @desc octopus app模块结构
	 */
    o.app = (function() {

        var app = null;

        /**
         * @private
         * @method octopus.app.registerModule
         * @param id
         * @param func
         * @param immediate
         */
        function registerModule(id, func, immediate) {
            initialize(undefined).registerModule(id, func, immediate);
        }

        /**
         * @private
         * @method initialize
         * @param options
         */
        function initialize(options) {
            return !app ? (app = new o.App(options), app) : (!!options ? (console.warn("The app has already exist! Failure to set up the config"), app) : app);
        }

        /**
         * @private
         * @method octopus.app.addConfig
         * @param id
         * @param obj
         */
        function addConfig(id, obj) {
            initialize(undefined).addConfig(id, obj);
        }

        /**
         * @private
         * @method octopus.app.registerApi
         * @param id
         * @param obj
         */
        function registerApi(id, obj){
            initialize(undefined).registerApi(id, obj);
        }

        return {
            /**
             * @public
             * @method octopus.app.addConfig
             * @param id
             * @param obj
             */
            addConfig: addConfig,

            /**
             * @public
             * @method octopus.app.registerApi
             * @param id
             * @param obj
             */
            registerApi: registerApi,

            /**
             * @public
             * @method octopus.app.registerModule
             * @param id
             * @param func
             * @param immediate
             * @desc 注册一个模块
             */
            registerModule: registerModule,

            /**
             * @public
             * @method octopus.app.initialize
             * @param options
             * @desc 初始化app对象 如果不被调用则按照默认属性初始化
             * @returns {octopus.App|app}
             */
            initialize: initialize
        };
    })();

    o.App = o.define({

        /**
         * @private
         * @property id
         * @type {String}
         */
        id: null,

        /**
         * @private
         * @property el
         * @type {DOMElement}
         * @desc app的根节点
         */
        el: null,

        /**
         * @private
         * @property viewEl
         * @type {DOMElement}
         * @desc 可视节点
         */
        viewEl: null,

        /**
         * @private
         * @property layers
         * @type {Array}
         * @desc 管理的模块
         */
        layers: null,

        /**
         * @private
         * @property currentLayer
         * @type {o.Layer}
         */
        currentLayer: null,

        /**
         * @private
         * @property cmds
         * @type {Array}
         */
        cmds: null,

        /**
         * @private
         * @property mCreator
         * @desc 生成器
         */
        mCreator: null,

        /**
         * @private
         * @property events
         * @type {o.Events}
         */
        events: null,

        /**
         * @private
         * @property eventListeners
         * @type {Object}
         */
        eventListeners: null,

        /**
         * @private
         * @property cmdManager
         * @type {o.CmdManager}
         */
        cmdManager: null,

        /**
         * @private
         * @property eventCaches
         * @desc 事件缓存 主要防止 一些模块未就位时的事件分发
         * @type {Array}
         */
        eventCaches: null,

        /**
         * @private
         * @property isLoad
         * @type {Boolean}
         */
        isLoad: false,

        /**
         * @private
         * @property config
         * @desc 配置项
         */
        config: null,

        /**
         * @private
         * @property isResize
         * @type {Boolean}
         */
        isResize: false,

        /**
         * @private
         * @property widgets
         */
        widgets: null,

        /**
         * @private
         * @property isInitDom
         */
        isInitDom: false,

        /**
         * @private
         * @property cacheEventDispatch
         * @desc 事件缓冲器
         */
        cacheEventDispatch: null,

        /**
         * @private
         * @property configs
         * @desc 配置项
         */
        configs: null,

        /**
         * @private
         * @constructor
         */
        initialize: function(options) {
            var config = this.config = o.extend({}, options);
            this.mCreator = {};
            this.eventCaches = [];
            this.configs = {};
            this.cacheEventDispatch = {};
            this.id = config.id || o.util.createUniqueID(this.CLASS_NAME + "_");

            //监听window事件 启动模块
            o.event.on(window, "ready", o.util.bind(this.onWindowLoad, this), false);
            o.event.on(window, "unload", o.util.bind(this.onWindowUnload, this), false);
            o.event.on(window, "resize", o.util.bind(this.onWindowResize, this), false);
            if("orientationchange" in window) {
                o.event.on(window, "orientationchange", o.util.bind(this.onOrientationChanged, this), false);
            }
            this.events = new o.Events(this);
            if(config.eventListeners && o.util.isObject(config.eventListeners)) {
                this.eventListeners = config.eventListeners;
                this.events.register(this.eventListeners);
            }
            //命令搞上去
            this.cmdManager = new o.CmdManager({
                app: this
            });
            if(config.cmds) {
                this.cmds = config.cmds;
                o.util.each(this.cmds, o.util.bind(this.registerCmd, this));
                this.cmds.length = 0;
            }
        },

        /**
         * @public
         * @method octopus.App.registerCmd
         * @param cmd {octopus.Cmd}
         */
        registerCmd: function(cmd) {
            this.cmdManager.register(cmd);
        },

        /**
         * @public
         * @method octopus.App.executeCmd
         * @param name {String}
         * @param ops {Object}
         * @desc 执行指定命令
         */
        executeCmd: function(name, ops) {
            this.cmdManager.executeCommand(name, ops);
        },

        /**
         * @public
         * @method octopus.App.unregisterCmd
         * @param name {String}
         */
        unregisterCmd: function(name) {
            this.cmdManager.unregister(name);
        },

        /**
         * @public
         * @method octopus.App.registerMember
         * @param type {String} 注册的种类 可选模块或者api
         * @param id {String} 注册的id
         * @param creator {Object | Function} 构造器
         */
        registerMember: function(type, id, creator) {
            this.mCreator[type] = this.mCreator[type] || {};
            return this.mCreator[type][id] = {
                creator: creator,
                instance: null
            };
        },

        /**
         * @public
         * @method octopus.App.startMember
         * @param type {String}
         * @param id {String}
         */
        startMember: function(type, id) {
            var creator = this.mCreator[type][id];
            if(!creator || creator.instance)   return;
            creator.instance = creator.creator(this, this.getConfig(id));
            creator.instance.init && creator.instance.init();
        },

        /**
         * @public
         * @method octopus.App.registerApi
         * @param id
         * @param m
         */
        registerApi: function(id, m) {
            this.registerMember("api", id, m);
            this.startApi(id);
        },

        /**
         * @public
         * @method octopus.App.registerModule
         * @param id {String}
         * @param m {Object | sr.Module}
         * @param immediate {Boolean}
         */
        registerModule: function(id, m, immediate) {
            this.registerMember("module", id, m);
            return (this.isLoad || !!immediate) ? (this.startModule(id), true) : false;
        },

        /**
         * @private
         * @method startModule
         * @param id {String}
         */
        startModule: function(id) {
            this.startMember("module", id);
        },

        /**
         * @private
         * @method octopus.App.startApi
         * @param id
         */
        startApi: function(id) {
            this.startMember("api", id);
        },

        /**
         * @private
         * @method getApi
         * @param id
         */
        getApi: function(id) {
            return this.mCreator["api"][id].instance;
        },

        /**
         * @private
         * @method octopus.App.getModule
         * @param id {String}
         */
        getModule: function(id) {
            return this.mCreator["module"][id].instance;
        },

        /**
         * @private
         * @method stopModule
         * @param id {String}
         */
        stopModule: function(id) {
            var moduleItem = this.mCreator["module"][id];
            if(!moduleItem.instance)   return;
            if (moduleItem.instance.destroy) {
                moduleItem.instance.destroy();
            }
            moduleItem.instance = null;
        },

        /**
         * @public
         * @method octopus.App.on
         * @param type {String} 事件名
         * @param func {Function} 回调
         */
        on: function(type, func) {
            this.events.on(type, func);
        },

        /**
         * @public
         * @method octopus.App.un
         * @param type {String} 事件名
         * @param func {Function} 回调
         */
        un: function(type, func) {
            this.events.un(type, func);
        },

        /**
         * @public
         * @method octopus.App.notify
         * @desc 触发某自定义事件
         * @param type {String}
         * @param evt {Object}
         */
        notify: function(type, evt) {
            if(!this.isLoad) {
                this.eventCaches.push([type, evt]);
                return;
            }
            this.events.triggerEvent(type, evt);
            for(var k in this.cacheEventDispatch) {
                if(k.indexOf(type) != -1) {
                    this.triggerEventDispatch(k, type, evt);
                    break;
                }
            }
        },

        /**
         * @private
         * @method octopus.App.triggerEventDispatch
         * @desc 通知缓冲器 活来了
         * @param id 缓冲器的key
         * @param type 完成的工作type
         * @param evt 完成的工作带来的变量
         */
        triggerEventDispatch: function(id, type, evt) {
            var dispatch = this.cacheEventDispatch[id];
            if(!dispatch && dispatch.hitFlag == dispatch.hits  || dispatch["cacheData"][type])  return;
            dispatch["cacheData"][type] = evt;
            if(++dispatch.hitFlag == dispatch.hits) {
                dispatch.func.apply(this, [dispatch.cacheData]);
                dispatch = null;
                delete this.cacheEventDispatch[id];
            }
        },

        /**
         * @public
         * @method octopus.App.addConfig
         * @param id
         * @param config
         */
        addConfig: function(id, config){
            config = config || {};
            var c, p;
            if(id) {
                c = this.configs[id] = this.configs[id] || {};
                for(p in config) {
                    c[p] = config[p];
                }
            } else {
                for(p in config) {
                    this.configs[p] = config[p];
                }
            }
        },

        /**
         * @private
         * @method octopus.App.getConfig
         * @param id
         */
        getConfig: function(id) {
            return this.configs[id] || {};
        },

        /**
         * @public
         * @method octopus.App.invokeEventDispatch
         * @desc 启用一个事件缓冲器 用来处理多次事件完成才做某事情的需求
         */
        invokeEventDispatch: function(events, func) {
            var dispatch = this.cacheEventDispatch[events],
                len = String(events).split(",").length;
            if(dispatch && dispatch.hitFlag == len) {
                throw new Error("this kind of EventDispatch has already invoked!");
                return;
            }
            this.cacheEventDispatch[events] = this.cacheEventDispatch[events] || {
                hits: len,
                hitFlag: 0,
                cacheData: {},
                func: func
            };
        },

        /**
         * @private
         * @method onWindowLoad
         * @desc 监听onload事件
         */
        onWindowLoad: function() {
            var that = this;
            o.util.each(this.mCreator["module"], function(item, k) {
                that.startModule(k);
            });
            this.isLoad = true;
            if(this.eventCaches) {
                var item;
                while(item = this.eventCaches.shift()) {
                    this.notify(item[0], item[1]);
                }
            }
            this.notify("Global-OctopusApp-ModuleCompleted", {});
        },

        /**
         * @private
         * @method onWindowUnload
         * @desc 监听页面的unload事件 针对低版本浏览器 主要做一些内存回收工作 至于高级浏览器 好吧 你可以认为我在自欺欺人
         */
        onWindowUnload: function() {
            var that = this;
            o.util.each(this.mCreator["module"], function(item, k) {
                that.stopModule(item);
            });
        },

        /**
         * @public
         * @method octopus.App.render
         */
        render: function(el) {
            if(!this.isLoad)    console.error("The page hasn't loaded!");
            el = o.g(el);
            if(!el)    console.error("Invalid node to render!");
            this.initDomMode(el);
        },

        /**
         * @private
         * @method initDomMode
         */
        initDomMode: function(el) {
            //节点模式
            this.isInitDom = true;
            var config = this.config,
                node = el,
                id = this.id + "_Octopus_ViewPort";
            this.el = o.dom.cloneNode(node, true);
            this.viewEl = o.dom.createDom("div", {
                id: id,
                "class": "octopus-viewport",
                style: "width: 100%; height: 100%; position: relative; z-index: 300; overflow: hidden"
            });
            this.el.appendChild(this.viewEl);
            //如果是节点模式且拥有图层
            if(config.layers) {
                o.util.each(config.layers, o.util.bind(this.addLayer, this));
            }
            //如果是节点模式且初始化widget控件
            if(config.widgets) {
                o.util.each(config.widgets, o.util.bind(this.addWidget, this));
            }
            this.notify("Global-OctopusApp-BeforeAppCompleted");
            //把被搞得面目全非的el加入文档流
            if(node) {
                node.parentNode.replaceChild(this.el, node);
                this.notify("Global-OctopusApp-AppCompleted");
            }
        },

        /**
         * @private
         * @method onOrientationChanged
         * @desc 监听横竖屏切换事件
         */
        onOrientationChanged: function() {
            this.notify("Global-OctopusApp-OnOrientationChanged");
        },

        /**
         * @private
         * @method onWindowResize
         */
        onWindowResize: function() {
            if(!this.isResize) {
                o.util.requestAnimation(o.util.bind(this.checkSize, this));
                this.isResize = true;
            }
        },

        /**
         * @private
         * @method checkSize
         */
        checkSize: function() {
            this.isResize = false;
            this.notify("Global-OctopusApp-OnWindowResize");
        },

        /**
         * @public
         * @method octopus.App.addLayer
         * @desc 给当前dom上增加图层 如果不存在this.el 则此方法没实际效果
         * @param layer {octopus.Layer}
         */
        addLayer: function(layer) {
            if(!this.layers)    this.layers = [];
            if(this.layers.indexOf(layer) != -1)  return;
            var el = layer.getEl();
            o.dom.addClass(el, "octopus-app-layer");
            this.setLayerZIndex(layer, this.layers.length);
            if(layer.isBaseLayer) {
                this.el.appendChild(el);
            } else {
                this.viewEl.appendChild(el);
            }
            if(layer.isCurrent) {
                this.setCurrentLayer(layer);
            }
            this.layers.push(layer);
            layer.setApp(this);
            this.notify("Global-OctopusApp-LayerAdd", {layer: layer});
            layer.afterAdd();
        },

        /**
         * @public
         * @method octopus.App.setCurrentLayer
         * @param layer
         */
        setCurrentLayer: function(layer) {
            if(this.currentLayer) {
                this.currentLayer.setCurrent(false);
            }
            this.currentLayer = layer;
            this.topLayer(layer);
            layer.setCurrent(true);
            this.notify("Global-OctopusApp-CurrentLayerChanged", {layer: layer});
        },

        /**
         * @private
         * @method setLayerZIndex
         * @desc 设置图层的index
         * @param layer {octopus.Layer}
         * @param zIdx {Number}
         */
        setLayerZIndex: function(layer, zIdx) {
            layer.setZIndex(this.Z_INDEX_BASE[layer.isBaseLayer ? "BaseLayer" : "Layer"] + zIdx * 5);
        },

        /**
         * @private
         * @method octopus.App.resetLayersZIndex
         * @desc reset图层zindex
         */
        resetLayersZIndex: function() {
            var that = this;
            o.util.each(this.layers, function(layer, i) {
                that.setLayerZIndex(layer, i);
            })
        },

        /**
         * @private
         * @method getTopZIndex
         */
        getTopZIndex: function() {
            var topIndex = {
                zindex: 0,
                index: 0
            };
            o.util.each(this.layers, function(layer, i) {
                var _zindex = layer.getEl().style.zIndex || 0;
                if(_zindex > topIndex.zindex) {
                    topIndex = {
                        zindex: _zindex,
                        index: i
                    }
                }
            });
            return topIndex;
        },

        /**
         * @public
         * @method octopus.App.topLayer
         */
        topLayer: function(layer) {
            var topIndex = this.getTopZIndex(),
                index = layer.el.style.zIndex;
            if(topIndex == index)	return;
            layer.el.style.zIndex = topIndex.zindex;
            this.layers[topIndex.index].el.style.zIndex = index;
        },

        /**
         * @public
         * @method octopus.App.getLayer
         * @param id {String}
         * @desc 靠id获取图层
         */
        getLayer: function(id) {
            var layer = null;
            o.util.each(this.layers, function(_layer) {
                if(id == _layer.id) {
                    layer = _layer;
                    return true;
                }
            });
            return layer;
        },

        /**
         * @public
         * @method octopus.App.removeLayer
         * @param layer
         * @desc 删掉图层
         */
        removeLayer: function(layer) {
            layer.getEl().parentNode.removeChild(layer.getEl());
            o.util.removeItem(this.layers, layer);
            layer.removeApp(this);
            layer.app = null;
            this.resetLayersZIndex();
            this.notify("Global-OctopusApp-LayerRemove", {layer: layer});
        },

        /**
         * @public
         * @method octopus.App.addWidget
         * @param widget {octopus.Widget}
         * @param auto {Boolean}
         * @desc 添加widget到app里
         */
        addWidget: function(widget, auto) {
            if(!this.widgets)    this.widgets = [];
            var index = this.widgets.indexOf(widget);
            if(index > -1)  return false;
            this.widgets.push(widget)
            if(!auto) {
                widget.container = widget.outsideViewport ? this.el : this.viewEl;
                widget.render();
            }
            widget.setZIndex(this.Z_INDEX_BASE.Widget + this.widgets.length * 5);
        },

        /**
         * @public
         * @method octopus.App.getWidget
         * @param id
         */
        getWidget: function(id) {
            var widget = null,
                i = 0,
                len = this.widgets.length;
            o.util.each(this.widgets, function(_widget) {
                if(_widget.id == id) {
                    widget = _widget;
                    return true;
                }
            });
            return widget;
        },

        /**
         * @public
         * @method octopus.App.removeWidget
         * @param widget {octopus.Widget}
         */
        removeWidget: function(widget) {
            if ((widget) && (widget == this.getWidget(widget.id))) {
                widget.el.parentNode.removeChild(widget.el);
                o.util.removeItem(this.widgets, widget);
            }
        },

        Z_INDEX_BASE: {
            BaseLayer: 0,
            Layer: 350,
            Widget: 750,
            Mask: 1000,
            Popup: 1500
        },

        CLASS_NAME: "octopus.App"
    });
})(octopus);/**
 * @file
 * webapp通用组件结构文件
 * 定义命令或操作
 * @author oupeng-fe
 * @version 1.1
 */
;(function(o, undefined) {

    "use strict";

    o.Cmd = o.define({

        /**
         * @private
         * @property name
         * @type {String}
         */
        name: null,

        /**
         * @private
         * @property active
         * @type {Boolean}
         */
        active: false,

        /**
         * @private
         * @property app
         * @type {octopus.App}
         */
        app: null,

        /**
         * @private
         * @constructor
         */
        initialize: function(name, options) {
            this.name = this.name || this.CLASS_NAME;
            o.extend(this, options)
        },

        /**
         * @public
         * @method octopus.Cmd.activate
         * @desc 激活命令状态
         */
        activate: function() {
            if(!this.active) {
                this.active = true;
            }
        },

        /**
         * @public
         * @method octopus.Cmd.deactivate
         * @desc 挂起命令状态
         */
        deactivate: function() {
            if(this.active) {
                this.active = false;
            }
        },

        /**
         * @public
         * @method octopus.Cmd.execute
         * @param option
         * @desc 执行命令
         */
        execute: function(option) {
            if(!this.active)	return false;
        },

        /**
         * @public
         * @method octopus.Cmd.unexecute
         * @desc 实现此方法的命令支持undo redo
         */
        unexecute: function() {
            if(!this.active)    return false;
        },

        /**
         * @public
         * @method octopus.Cmd.setApp
         * @page {octopus.App}
         * @desc 绑定命令到app
         */
        setApp: function(app) {
            if(this.app != app) {
                this.app = app;
            }
        },
        CLASS_NAME: "octopus.Cmd"
    });
})(octopus);/**
 * @file
 * webapp通用组件结构文件
 * 定义命令管理类
 * @author oupeng-fe
 * @version 1.1
 */
;(function(o, undefined) {

    "use strict";

    o.CmdManager = o.define({

        /**
         * @private
         * @property app
         * @type {octopus.App}
         */
        app: null,

        /**
         * @private
         * @property commands
         * @type {Array}
         */
        commands: null,

        /**
         * @private
         * @property executeCmds
         * @type {Array}
         */
        executeCmds: null,

        /**
         * @private
         * @property name
         * @type {String}
         */
        name: null,

        /**
         * @private
         * @constructor
         */
        initialize: function(options) {
            o.extend(this, options);
            !!this.app ? (this.setApp(this.app), true) : false;
            this.name = this.name || o.util.createUniqueID(this.CLASS_NAME + "_");
            this.commands = this.commands || [];
            this.executeCmds = this.executeCmds || [];
        },

        /**
         * @public
         * @method octopus.CmdManager.setApp
         * @param app {octopus.App}
         */
        setApp: function(app) {
            this.app == app ? false : (this.app = app, true);
        },

        /**
         * @public
         * @method octopus.CmdManager.register
         * @param command {o.Cmd}
         * @desc 注册一个命令到命令管理器
         */
        register: function (command) {
            var index = this.commands.indexOf(command);
            if(index != -1)	return false;
            this.commands.push(command);
            command.setApp(this.app);
            return true;
        },

        /**
         * @public
         * @method octopus.CmdManager.unregister
         * @param name {String}
         */
        unregister: function(name) {
            var index = this.getCommandIndexByName(name);
            if(index == -1)	return false;
            this.commands.splice(index, 1);
            return true;
        },

        /**
         * @private
         * @method getCommandIndexByName
         */
        getCommandIndexByName: function(name) {
            var len = this.commands.length,
                i = len;
            for(; i--; ) {
                if(name == this.commands[i].name) {
                    return i;
                }
            }
            return -1;
        },

        /**
         * @public
         * @method octopus.CmdManager.executeCommand
         * @param name {String} 命令名
         * @param option {Object}
         */
        executeCommand: function(name, option) {
            var index = this.getCommandIndexByName(name);
            if(index == -1)	return;
            this.commands[index].execute(option);
        },

        /**
         * @public
         * @method octopus.CmdManager.destroy
         */
        destroy: function () {
            this.app = null;
        },

        CLASS_NAME: "octopus.CmdManager"
    });

})(octopus);/**
 * @file
 * webapp通用组件结构文件
 * 定义图层基类
 * @author oupeng-fe
 * @version 1.1
 */
;(function(o, undefined) {

    "use strict";

    o.Layer = o.define({
        /**
         * @private
         * @property id
         * @type {String}
         */
        id: null,

        /**
         * @private
         * @property config
         * @type {Object}
         */
        config: null,

        /**
         * @private
         * @property isCurrent
         * @type {Boolean}
         */
        isCurrent: false,

        /**
         * @private
         * @property event
         * @type {octopus.Events}
         */
        event: null,

        /**
         * @private
         * @property el
         * @type {DOMElement}
         */
        el: null,

        /**
         * @private
         * @property octopus.Layer.isBaseLayer
         * @type {Boolean}
         */
        isBaseLayer: false,

        /**
         * @private
         * @property widgets
         * @type {Array}
         */
        widgets: null,

        /**
         * @private
         * @property app
         * @type {octopus.App}
         */
        app: null,

        /**
         * @private
         * @constructor
         */
        initialize: function(options) {
            var config = this.config = o.extend({}, options);
            this.id = config.id || o.util.createUniqueID(this.CLASS_NAME + "_");
            this.el = o.dom.createDom("div", {
                id: this.id
            });
            this.isCurrent = config.isCurrent || this.isCurrent;
            this.isBaseLayer = config.isBaseLayer || this.isBaseLayer;
            if(this.isCurrent || this.isBaseLayer) {
                o.dom.addClass(this.el, "octopus-layer-base");
            }
            this.event = new o.Events(this);
        },

        /**
         * @public
         * @method octopus.Layer.getEl
         * @return {DOMElement}
         */
        getEl: function() {
            return this.el;
        },

        /**
         * @public
         * @method octopus.Layer.on
         * @desc 事件监听
         * @param type {String}
         * @param func {Function}
         */
        on: function(type, func) {
            this.events.on(type, func);
        },

        /**
         * @public
         * @method octopus.Layer.un
         * @desc 事件取消监听
         * @param type {String}
         * @param func {Function}
         */
        un: function(type, func) {
            this.events.un(type, func);
        },

        /**
         * @public
         * @method octopus.Layer.setApp
         * @desc 绑定app
         * @param app {octopus.App}
         */
        setApp: function(app) {
            return app == this.app ? false : (this.app = app, true);
        },

        /**
         * @public
         * @method octopus.Layer.afterAdd
         * @desc 绑定入app后调用
         */
        afterAdd: function() {

        },

        /**
         * @public
         * @method octopus.Layer.setCurrent
         * @param current {Boolean}
         */
        setCurrent: function(current) {
            if((current && this.isCurrent) || (!current && !this.isCurrent)) return;
            this.isCurrent = current;
            current ? o.dom.addClass(this.el, "octopus-layer-show") : o.dom.removeClass(this.el, "octopus-layer-show");
        },

        /**
         * @public
         * @method octopus.Layer.setZIndex
         * @param zIndex {Number}
         */
        setZIndex: function(zIndex) {
            this.el.style.zIndex = zIndex;
        },

        activate: function() {

        },

        deactivate: function() {

        },

        removeApp: function() {

        },

        CLASS_NAME: "octopus.Layer"
    });
})(octopus);
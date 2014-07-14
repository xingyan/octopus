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
<<<<<<< HEAD
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
                o.util.getParameterString(data || {})), "callback=" + callbackName);
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
=======
>>>>>>> FETCH_HEAD
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

        return {
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
         * @property moduleCreator
         * @desc 生成器
         */
        moduleCreator: null,

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
         * @constructor
         */
        initialize: function(options) {
            var config = this.config = o.extend({}, options);
            this.moduleCreator = {};
            this.eventCaches = [];
            this.id = config.id || o.util.createUniqueID(this.CLASS_NAME + "_");

            //监听window事件 启动模块
            o.event.on(window, "ready", o.util.bind(this.onWindowLoad, this), false);
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
         * @method octopus.App.registerModule
         * @param id {String}
         * @param m {Object | octopus.Module}
         * @param immediate {Boolean}
         */
        registerModule: function(id, m, immediate) {
            this.register2ModuleCreator(id, m);
            return (this.isLoad || !!immediate) ? (this.startModule(id), true) : false;
        },

        /**
         * @private
         * @method register2ModuleCreator
         * @param id {String} 注册的id
         * @param creator {Object | Function} 构造器
         */
        register2ModuleCreator: function(id, creator) {
            return this.moduleCreator[id] = {
                creator: creator,
                instance: null
            };
        },

        /**
         * @private
         * @method startModule
         * @param id {String}
         */
        startModule: function(id) {
            var creator = this.moduleCreator[id];
            if(creator.instance)   return;
            creator.instance = creator.creator(this);
            if(!creator.instance) {
                console.error("Module " + id + " didn't work for its invalid returns! It should be an object!");
            } else if(!creator.instance.initialize) {
                console.error("Module " + id + " didn't work for its invalid returns! It should has the method 'initialize'!");
            }
            creator.instance.initialize && creator.instance.initialize();
        },

        /**
         * @private
         * @method octopus.App.getModule
         * @param id {String}
         */
        getModule: function(id) {
            return this.moduleCreator[id].instance;
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
        },

        /**
         * @private
         * @method onWindowLoad
         * @desc 监听onload事件
         */
        onWindowLoad: function() {
            var that = this;
            o.util.each(this.moduleCreator, function(item, k) {
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
            console.log(o.Events);
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
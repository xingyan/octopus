/**
 * @file
 * webapp通用组件基础库文件，主要用于通用组件的类结构声明
 * @author oupeng-fe
 * @version 0.1
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
        o = octopus = {version: "0.1"};

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
     * @return new Class {function}
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
        var f = function() {};
        f.prototype = father.prototype;
        child.prototype = new f;
        child.prototype.superclass = f.prototype;
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

    /**
     * @method octopus.g
     * @desc 靠id拿个节点 由于只是简单支持 没有必要写得那么高级
     * @return {DOMElement}
     */
    o.g = function() {
        var elements = [];
        for(var i = 0, len = arguments.length; i < len; i++) {
            var element = arguments[i];
            if(typeof element == 'string') {
                element = document.getElementById(element);
            }
            if(arguments.length == 1) {
                return element;
            }
            elements.push(element);
        }
        return elements || null;
    };

    /**
     * @method octopus.$
     * @desc 不想重复的去写这么多
	 * @param filter {String}
	 * @param el {String | DOMElement}
     * @returns {NodeList}
     */
    o.$ = function(filter, el) {
		el = o.g(el) || document;
        return el.querySelectorAll(filter) || null;
    };

	/**
	 * @method octopus.one
	 * @param filter {String}
	 * @param el {DOMElement}
	 */
	o.one = function(filter, el) {
		el = o.g(el) || document;
		return el.querySelector(filter) || null;
	};

    if(!window.$) {
        window.$ = o.$;
    }
    window.octopus = o;

})(window);
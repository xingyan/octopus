/**
 * @file
 * webapp通用组件基础库文件
 * dom -   dom操作部分
 * @require lib/class.js
 * @require lib/util.js
 * @author oupeng-fe
 * @version 0.1
 */
(function(o, undefined) {

    "use strict";

    /**
     * @namespace octopus.dom
     * @desc 一些基础的dom操作
     */
    o.dom = {
        /**
         * @method octopus.dom.hasClass
         * @desc 判断节点有class
         * @param el {DOMElement}
         * @param name {String}
         */
        hasClass: function(el, name) {
            var element = o.g(el),
                names;
            return !!element.classList ? element.classList.contains(name) :
                (names = element.className, !!names && new RegExp("(^|\\s)" + name + "(\\s|$)").test(names));
        },

        /**
         * @method octopus.dom.addClass
         * @desc 给指定节点增加class
         * @param el {DOMElement}
         * @param name {String}
         */
        addClass: function(el, name) {
            var element = o.g(el);
            var classList = element.classList
            if(!!classList) {
                if(!classList.contains(name)) {
                    element.classList.add(name);
                }
            } else {
                if(!o.dom.hasClass(element, name)) {
                    element.className += (element.className ? " " : "") + name;
                }
            }
            return element;
        },

        /**
         * @method octopus.dom.removeClass
         * @desc 删除指定节点的指定class
         * @param el {DOMElement}
         * @param name {String}
         */
        removeClass: function(el, name) {
            var element = o.g(el),
                names;
            var classList = element.classList;
            if(!!classList) {
                if(classList.contains(name)) {
                    element.classList.remove(name);
                }
            } else {
                if(o.dom.hasClass(element, name)) {
                    names = element.className;
                    if(names) {
                        element.className = o.util.trim(
                            names.replace(
                                new RegExp("(^|\\s+)" + name + "(\\s+|$)"), " "
                            )
                        );
                    }
                }
            }
            return element;
        },

        /**
         * @method octopus.dom.getWidth
         * @desc 获得指定节点的宽度
         * @param el {DOMElement}
         */
        getWidth: function(el) {
            var element = o.g(el);
            var width = !!element.offsetWidth ? element.offsetWidth : element.clientWidth;
            return width > 0 ? width : 0;
        },

        /**
         * @method octopus.dom.getHeight
         * @desc 获得指定节点高度
         * @param el {DOMElement}
         */
        getHeight: function(el) {
            var element = o.g(el);
            var height = !!element.offsetHeight ? element.offsetHeight : element.clientHeight;
            return height > 0 ? height : 0;
        },

        /**
         * @method octopus.dom.insertAfter
         * @desc 插到指定节点后面
         * @param newdom {DOMELement}
         * @param tardom {DOMElement}
         */
        insertAfter: function(newdom, tardom) {
            tardom = o.g(tardom);
            tardom.parentNode.insertBefore(newdom, tardom.nextSibling);
            return newdom;
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
                    el.style[k] = obj[k];
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
                value = el.style[o.util.camelize(style)];
                if (!value) {
                    if (document.defaultView &&
                        document.defaultView.getComputedStyle) {
                        var css = document.defaultView.getComputedStyle(el, null);
                        value = css ? css.getPropertyValue(style) : null;
                    } else if (el.currentStyle) {
                        value = el.currentStyle[o.util.camelize(style)];
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
         * @method octopus.dom.createDom
         * @desc 创建dom节点
         * @param type {String} dom类型
         * @param atts {Object} dom属性名值对
         * @param stys {Object} dom样式名值对
         */
        createDom: function(type, atts, stys) {
            var dom = document.createElement(type);
            atts && o.util.each(atts, function(v, att) {
                dom.setAttribute(att, v);
            });
            stys && o.dom.setStyles(dom, stys, true);
            return dom;
        },

        /**
         * @method octopus.dom.cloneNode
         * @desc clone节点 可以将事件一起clone 该事件必须是通过此框架加上的
         * @param el {DOMElement} 待clone的节点
         * @param ev {Boolean} 是否clone事件监听
         */
        cloneNode: function(el, ev) {
            ev = ev || false;
            var cloneEl = o.g(el).cloneNode(true);
            if(!ev || !el._eventCacheID) return cloneEl;
            var obs = o.event.observers[el._eventCacheID];
            o.util.each(obs, function(item, i) {
                var name = item.name,
                    observer = o.util.clone(item.observer),
                    useCapture = o.util.clone(item.useCapture);
                o.event.on(cloneEl, name, observer, useCapture);
            });
            return cloneEl;
        }
    };
})(octopus);

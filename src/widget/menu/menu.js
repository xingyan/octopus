/**
 * @file
 * @author oupeng-fe
 * @version 0.1
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
            this.superclass.initialize.apply(this, arguments);
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
            this.superclass.show.apply(this, arguments);
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
            var h = this.superclass.hidden;
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

})(octopus);
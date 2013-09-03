/**
 * @file
 * @author oupeng-fe
 * @version 0.1
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
         * @constructor
         */
        initialize: function() {
            o.Widget.prototype.initialize.apply(this, arguments);
            o.dom.addClass(this.el, "octopusui-mask");
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
            this.isShow = false;
            this.show();
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
                new o.Tween(this.el, "opacity", 0, 1, .4, o.util.empty, {
                    ease: "ease-out"
                });
            } else {
                new o.Tween(this.el, "opacity", 1, 0, .4, o.util.bind(this._hidden, this), {
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
                new o.Tween(this.el, ["opacity", "-webkit-transform"], [0, "scale(0)"], [1, "scale(1)"], .4);
            } else {
                new o.Tween(this.el, ["opacity", "-webkit-transform"], [1, "scale(1)"], [0, "scale(0)"], .4, o.util.bind(this._hidden, this));
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
                new o.Tween(this.el, ["opacity", "-webkit-transform"], [0, "rotate(-90deg)"], [1, "rotate(0deg)"], .4);
            } else {
                new o.Tween(this.el, ["opacity", "-webkit-transform"], [1, "rotate(0deg)"], [0, "rotate(90deg)"], .4, function() {
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

})(octopus);
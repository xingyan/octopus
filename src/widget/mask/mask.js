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
 * @require widget/widget.js
 */
;console.log("mask");;(function(o, undefined) {

    "use strict";

    /**
     * @class octopus.Widget.Mask
     * @parent octopus.Widget
     * @desc 浮层遮罩
     * @type {*|new|new}
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
         */
        isResize: false,

        /**
         * @private
         * @property animation
         * @type {Boolean}
         */
        animation: true,

        /**
         * @private
         * @property toOpacity
         */
        toOpacity: .5,

        /**
         * @private
         * @constructor
         */
        initialize: function() {
            this.superclass.initialize.apply(this, arguments);
            o.dom.addClass(this.el, "octopusui-mask");
        },

        /**
         * @private
         * @method initEvent
         */
        initEvent: function() {
            !this.isScroll && o.event.on(document, "touchmove", o.util.bindAsEventListener(this.onTouchMove, this), false);
            ("orientationchange" in window) ? o.event.on(window, "orientationchange", o.util.bind(this.calcSelfSize, this), false)
                : o.event.on(window, "resize", o.util.bind(this.calcSelfSize, this), false);
        },

        /**
         * @private
         * @method calcSelfSize
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
         */
        onTouchMove: function(e) {
            this.isShow && o.event.stop(e);
        },

        /**
         * @public
         * @method octopus.Widget.Mask.activate
         */
        activate: function() {
            this.superclass.activate.apply(this, arguments);
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
                height: Math.max(this.container.scrollHeight, this.container.clientHeight) - 1 + "px"
            }, true);
            this.isResize = false;
        },

        /**
         * @public
         * @method octopus.Widget.Mask.show
         */
        show: function() {
            console.log("show: " + this.isShow);
            if(this.isShow) return;
            this.isShow = true;
            this.el.style.visibility = "visible";
            if(this.animation) {
                return new o.Tween(this.el, "opacity", 0, .5, .4, o.util.empty, {
                    ease: "ease-out"
                });
            }
        },

        /**
         * @public
         * @method octopus.Widget.Mask.hidden
         */
        hidden: function() {
            console.log(this.isShow);
            if(!this.isShow)    return;
            this.isShow = false;
            console.log("this.animation: " + this.animation);
            if(this.animation) {
                try {
                    new o.Tween(this.el, "opacity", .5, 0, .4, o.util.bind(this._hidden, this), {
                        ease: "ease-out"
                    });
                } catch(e) {
                    console.log(e.message);
                }

            } else {
                this._hidden();
            }
        },

        /**
         * @private
         * @method _hidden
         */
        _hidden: function() {
            console.log("sucess");
            this.el.style.visibility = "hidden";
        },

        CLASS_NAME: "octopus.Widget.Mask"
    });

})(octopus);
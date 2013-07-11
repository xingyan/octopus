/**
 * @file
 * @author oupeng-fe
 * @version 0.1
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
         * @property right
         * @type {Number}
         * @desc 控件距离右边距离
         */
        right: 10,

        /**
         * @private
         * @property isAbsolute
         * @type {Boolean}
         */
        isAbsolute: false,

        /**
         * @private
         * @property scrollTimer
         * @type {Number}
         */
        scrollTimer: null,

        /**
         * @private
         * @property isScroll
         * @type {Boolean}
         */
        isScroll: false,

        /**
         * @private
         * @property customize
         * @type {Boolean}
         */
        customize: false,

        /**
         * @private
         * @property animation
         * @type {Boolean}
         */
        animation: false,

        /**
         * @pirvate
         * @property loop
         * @type {Object}
         */
        loop: null,

        /**
         * @private
         * @property count
         * @type {Number}
         */
        count: 0,

        /**
         * @private
         * @constructor
         */
        initialize: function() {
            this.superclass.initialize.apply(this, arguments);
            o.dom.addClass(this.el, "octopusui-back2top");
            this.loop = {};
            this.initFixed();
            this.initEvent();
        },

        /**
         * @private
         * @method initFixed
         * @desc 初始化fix属性 让其兼容所有浏览器
         */
        initFixed: function() {
            var that = this;
            if(/M031/.test(navigator.userAgent)) {
                this.el.style.position = "absolute";
                this.isAbsolute = true;
            } else {
                o.dom.setStyles(this.el, {
                    position: "fixed",
                    bottom: this.bottom + "px",
                    right: this.right + "px"
                });
            }
        },

        /**
         * @private
         * @method initEvent
         */
        initEvent: function() {
            o.event.on(document, "touchmove", o.util.bindAsEventListener(this.onTouchMove, this), false);
            o.event.on(document, "scroll", o.util.bindAsEventListener(this.onJudgeScroll, this), false);
            o.event.on(document, "touchend", o.util.bindAsEventListener(this.onTouchEnd, this), false);
            o.event.on(document, "touchcancel", o.util.bindAsEventListener(this.onTouchEnd, this), false);
            this.on("tap", o.util.bindAsEventListener(this.onTap, this));
        },

        /**
         * @private
         * @method onClick
         */
        onTap: function(e) {
            this.notify("back2top-ontap", e);
            !this.customize && this.goTo(1, this.animation);

        },

        /**
         * @private
         * @method goTo
         * @param y {Number}
         * @param animation {Boolean}
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
            this.hidden();
            this.scrollTimer = window.setTimeout(o.util.bind(this.onScrollStop, this), 300);
            this.isScroll = false;
        },

        /**
         * @private
         * @method onScrollStop
         */
        onScrollStop: function() {
            this.isAbsolute && this.startFixed();
            this.checkIfVisible();
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
         */
        startFixed: function() {
            if(!this.active)    return;
            o.dom.setStyles(this.el, {
                top: window.pageYOffset + window.innerHeight - parseInt(this.getHeight()) - this.bottom + "px",
                left: document.body.offsetWidth - parseInt(this.getWidth()) - this.right + "px"
            });
        },

        /**
         * @private
         * @method activate
         */
        activate: function() {
            this.superclass.activate.apply(this, arguments);
            this.isShow = false;
        },

        CLASS_NAME: "octopus.Widget.Back2Top"
    });

})(octopus);
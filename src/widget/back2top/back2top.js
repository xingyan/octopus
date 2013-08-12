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
         * @pirvate
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
            this.superclass.initialize.apply(this, arguments);
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

})(octopus);
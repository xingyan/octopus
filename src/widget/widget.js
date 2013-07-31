/**
 * @file
 * webapp通用组件父类
 * @author oupeng-fe
 * @version 0.1
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
     * @param dom {String | DOMElement}
     * @param options {Object}
     * @param options.el {DOMElement} 根节点 如果没有则创建一个div
     * @param options.id {String} widget的id 也会成为根节点的id
     * @param eventListeners {Object} 用以批量添加事件
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
         * @constructor octopus.Widget.initialize
         * @desc 构造函数
         * @param options  -   {Object}
         */
        initialize: function(options) {
            options = options || {};
            this.addOptions(options);
            this.el = this.el || document.createElement("div");
            this.id = this.id || o.util.createUniqueID(this.CLASS_NAME + "_");
            this.el.id = this.id;
            this.events = new o.Events(this);
            this.gesture = o.gesture;
            if(this.eventListeners instanceof Object) {
                this.events.register(this.eventListeners);
            }
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
            if(!this.isShow) {
                this.show();
            }
            if(!this.active) {
                this.activate();
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
            this.active = true;
        },

        /**
         * @public
         * @method octopus.Widget.deactivate
         * @desc 挂起控件
         */
        deactivate: function() {
            if(!this.active)    return;
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

        CLASS_NAME: "octopus.Widget"
    });

    o.Widget.GESTURES = ["tap", "lontap", "doubletap", "swipe", "swipeleft",
        "swiperight", "swipeup", "swipedown", "drag", "drapleft", "dragright",
        "dragup", "dragdown", "touch", "release"];

})(octopus);
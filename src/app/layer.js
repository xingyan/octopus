/**
 * @file
 * webapp通用组件结构文件
 * 定义图层基类
 * @author oupeng-fe
 * @version 0.1
 */
(function(o, undefined) {

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
         * @public
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
                o.dom.addClass(this.el, "octopus-layer-show");
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

        CLASS_NAME: "octopus.Layer"
    });
})(octopus);
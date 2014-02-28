/**
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
})(octopus);
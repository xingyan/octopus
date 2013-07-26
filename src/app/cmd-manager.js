/**
 * @file
 * webapp通用组件结构文件
 * 定义命令管理类
 * @author oupeng-fe
 * @version 0.1
 */
;(function(o, undefined) {

    "use strict";

    o.CmdManager = o.define({

        /**
         * @private
         * @property app
         * @type {octopus.App}
         */
        app: null,

        /**
         * @private
         * @property commands
         * @type {Array}
         */
        commands: null,

        /**
         * @private
         * @property executeCmds
         * @type {Array}
         */
        executeCmds: null,

        /**
         * @private
         * @property name
         * @type {String}
         */
        name: null,

        /**
         * @private
         * @constructor
         */
        initialize: function(options) {
            o.extend(this, options);
            !!this.app ? (this.setApp(this.app), true) : false;
            this.name = this.name || o.util.createUniqueID(this.CLASS_NAME + "_");
            this.commands = this.commands || [];
            this.executeCmds = this.executeCmds || [];
        },

        /**
         * @public
         * @method octopus.CmdManager.setApp
         * @param app {octopus.App}
         */
        setApp: function(app) {
            this.app == app ? false : (this.app = app, true);
        },

        /**
         * @public
         * @method octopus.CmdManager.register
         * @param command {o.Cmd}
         * @desc 注册一个命令到命令管理器
         */
        register: function (command) {
            var index = this.commands.indexOf(command);
            if(index != -1)	return false;
            this.commands.push(command);
            command.setApp(this.app);
            return true;
        },

        /**
         * @public
         * @method octopus.CmdManager.unregister
         * @param name {String}
         */
        unregister: function(name) {
            var index = this.getCommandIndexByName(name);
            if(index == -1)	return false;
            this.commands.splice(index, 1);
            return true;
        },

        /**
         * @private
         * @method getCommandIndexByName
         */
        getCommandIndexByName: function(name) {
            var len = this.commands.length,
                i = len;
            for(; i--; ) {
                if(name == this.commands[i].name) {
                    return i;
                }
            }
            return -1;
        },

        /**
         * @public
         * @method octopus.CmdManager.executeCommand
         * @param name {String} 命令名
         * @param option {Object}
         */
        executeCommand: function(name, option) {
            var index = this.getCommandIndexByName(name);
            if(index == -1)	return;
            this.commands[index].execute(option);
        },

        /**
         * @public
         * @method octopus.CmdManager.destroy
         */
        destroy: function () {
            this.app = null;
        },

        CLASS_NAME: "octopus.CmdManager"
    });

})(octopus);
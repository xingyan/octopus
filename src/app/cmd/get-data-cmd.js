;(function(o, undefined) {

    "use strict";

    o.Cmd.GetDataCmd = o.define(o.Cmd, {

        url: "",

        initialize: function() {
            o.Cmd.prototype.initialize.apply(this, arguments);
        },

        getData: function(opts) {
            var opts = opts[0],
                type = opts.type || "get";
            this.url = (opts.url && opts.url != this.url) ? opts.url : this.url;
            o.ajax[type]({
                url: this.url,
                timeout: opts.timeout || 0,
                data: opts.data || {},
                complete: opts.complete,
                error: opts.error,
                success: opts.success
            });
        },

        execute: function() {
            o.Cmd.prototype.execute.apply(this, arguments);
            if(!arguments[0] && this.url == "")   console.error("Cmd " + this.CLASS_NAME + " need the options to execute!");
            this.getData(arguments);
        },

        CLASS_NAME: "octopus.Cmd.GetDataCmd"
    });

})(octopus);
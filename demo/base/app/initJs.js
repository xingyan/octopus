;(function(o, undefined) {

    "use strict";

    if(!window.webkitRequestAnimationFrame) {
        alert("请拿出职业精神，使用webkit内核的浏览器！");
        return;
    }

    o.app.initialize({
        layers: [new o.Layer.BackLayer({
            id: "octopus_bk_layer"
        })],
        cmds: [new o.Cmd.GetDataCmd(), new o.Cmd.ChangeLayerCmd()]
    });


    o.app.registerModule("InitData", function(app) {

        var
            /**
             *
             *
             */
            debugUrl = "http://192.168.1.34:8000/",
            //debugUrl = "http://127.0.0.1:8000/",
            currentColumn = null;

        function executeCmd(opts) {
            app.executeCmd("octopus.Cmd.GetDataCmd", {
                url: debugUrl + opts.ars,
                success: opts.onSuccess,
                data: opts.data,
                type: "ajaxJSONP"
            });
        }

        function initialize() {
            var urlobj = window.location.hash.replace(/#/g, "").split(/[&;]/),
                arg = {},
                i = urlobj.length;
            for(; i--; ) {
                var ars = urlobj[i].split("=");
                arg[ars[0]] = ars[1];
            }
            currentColumn = arg.type || "0";
            getNavData();
            app.executeCmd("octopus.Cmd.ChangeLayerCmd", currentColumn);
        }

        function getNavData() {
            executeCmd({
                ars: "getCategory",
                onSuccess: onNavCompleted
            });
        }

        function onNavCompleted(data) {
            app.notify("InitData-navCompleted", {
                current: currentColumn,
                content: data
            });
        }

        function onError(e) {

        }

        function onSuccess() {

        }

        function onDebug() {

        }

        return {
            initialize: initialize
        }
    }, true);

})(octopus);
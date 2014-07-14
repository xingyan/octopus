(function(o, undefined) {

    "use strict";

    o.app.registerModule("Init-Animation", function(app) {

        var
            pageReady = false,

            navReady = false,

            appReady = false,

            current,

            loadingDom = null,

            progress = null,

            navMenu;

        function initialize() {
            app.on("Global-OctopusApp-ModuleCompleted", pageLoaded);
            app.on("InitData-navCompleted", onDataCompleted);
            app.on("octopus-App-BeforeRender", onLayerCompleted);
            app.on("Global-OctopusApp-CurrentLayerChanged", onLayerChanged);
            progress = new o.Widget.Progress({
                id: "octopus_progress"
            });
            app.addWidget(progress, true);
        }

        function onLayerChanged() {
            setTimeout(function() {
                finishProgress();
            }, 500);
        }

        function pageLoaded() {
            progress.render();
            progress.passTrick();
            pageReady = true;
            if(navReady && appReady) {
                initAnimation();
            }
        }

        function formatNavData(data) {
            o.util.each(data, function(item) {
                var id = item.id;
                if(item.children) {
                    item.children = formatNavData(item.children);
                }
                if(current == id) {
                    item.current = "true";
                }
                if(item.cid) {
                    o.util.each(item.cid, function(_item) {
                        if(_item == current) {
                            item.current = "true";
                        }
                    })
                }
            });
            return data;
        }

        function onDataCompleted(opts) {
            opts = o.util.clone(opts);
            current = opts.current;
            var content = formatNavData(opts.content.content);
            navMenu = new o.Widget.NavMenu({
                id: "octopus_demo_menu",
                data: content
            });
            navMenu.on("octopus-NavMenu-ToogleBar", toogleBar);
            navMenu.on("octopus-NavMenu-ItemClick", changeLayer)
            navReady = true;
            if(pageReady && appReady) {
                initAnimation();
            }
        }

        function changeLayer(id) {
            progress.passTrick();
            app.executeCmd("octopus.Cmd.ChangeLayerCmd", id);

        }

        function toogleBar(opt) {
            if(opt) {
                o.dom.removeClass(app.el, "octopus-menu-deactivate");
            } else {
                o.dom.addClass(app.el, "octopus-menu-deactivate");
            }
            app.notify("octopus-menu-toogle", opt);
        }

        function onLayerCompleted() {
            appReady = true;
            if(pageReady && navReady) {
                initAnimation();
            }
        }

        function finishProgress() {
            progress.goTo({
                "value": 100,
                "duration": .4,
                type: "animation",
                func: function() {
                    setTimeout(function() {
                        progress.goTo({
                            value: 0
                        });
                    }, 0);
                }
            });
        }

        function initAnimation() {
            app.render("octopus_page");
            app.addWidget(navMenu);
            loadingDom = o.g("loading_mask");
            o.animate({
                el: loadingDom,
                type: "fade",
                func: function() {
                    this.el.style.display = "none";
                    pageReady = null;
                    navReady = null;
                    appReady = null;
                }
            });
        }

        return {
            initialize: initialize
        }
    }, true);

})(octopus);
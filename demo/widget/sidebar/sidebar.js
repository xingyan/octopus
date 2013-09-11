(function(o, undefined) {

    "use strict";

    o.event.on(window, "ready", onReady, false);

    var leftsidebar = new o.Widget.Sidebar({
            width: "30%",
            position: "left",
            nextDom: "content_container",
            innerHTML: "left"
        }),
        rightsidebar = new o.Widget.Sidebar({
            width: "30%",
            position: "right",
            nextDom: "content_container",
            innerHTML: "right"
        }),
        topsidebar = new o.Widget.Sidebar({
            height: "30%",
            position: "top",
            nextDom: "content_container",
            innerHTML: "top"
        }),
        bottomsidebar = new o.Widget.Sidebar({
            height: "30%",
            position: "bottom",
            nextDom: "content_container",
            innerHTML: "bottom"
        }),
        currentSidebar;

    function onReady() {
        var d = o.g("content_container");
        o.gesture(d).on("tap", function(e) {
            var t = e.target;
            if(!o.dom.hasClass(t, "btn") || leftsidebar.isShow || rightsidebar.isShow
                || topsidebar.isShow || bottomsidebar.isShow)   return;
            var h = t.innerHTML.toLowerCase().split("-"),
                direction = h[0],
                type = h[1];
            var r = direction + "sidebar.active ? " + direction + "sidebar.show('" + type + "') : " + direction
                + "sidebar.render('sidebar_container', null, '" + type + "');" +
                "if(currentSidebar != " + direction + "sidebar) { currentSidebar = " + direction + "sidebar; }";
            eval(r);
        });
        o.gesture(document).on("tap", function(e) {
            var t = e.target;
            if(!currentSidebar || t == currentSidebar.getEl() || !currentSidebar.isShow) return;
            o.event.stop(e);
            currentSidebar.hidden();
        });
    }

})(octopus);
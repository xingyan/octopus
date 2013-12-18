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
    var bars = {
        "left": leftsidebar,
        "right": rightsidebar,
        "top": topsidebar,
        "bottom": bottomsidebar
    }
    function onReady() {
        var d = o.g("content_container");
        o.gesture(d).on("tap", function(e) {
            var t = e.target;
            if(!o.dom.hasClass(t, "btn") || leftsidebar.isShow
                || rightsidebar.isShow || topsidebar.isShow ||
                bottomsidebar.isShow || leftsidebar.locked || rightsidebar.locked
                || topsidebar.locked || bottomsidebar.locked) {
                return;
            }
            var h = t.innerHTML.toLowerCase().split("-"),
                direction = h[0],
                type = h[1],
                bar = bars[direction];
            bar.active ? bar.show(type) : bar.render("sidebar_container", null, type);
            if(currentSidebar != bar) {
                currentSidebar = bar;
            }
        });
        o.gesture(document).on("tap", function(e) {
            var t = e.target;
            if(!currentSidebar || t == currentSidebar.getEl()
                || !currentSidebar.isShow || leftsidebar.locked || rightsidebar.locked
                || topsidebar.locked || bottomsidebar.locked) {
                return;
            }
            o.event.stop(e);
            currentSidebar.hidden();
        });
    }

})(octopus);
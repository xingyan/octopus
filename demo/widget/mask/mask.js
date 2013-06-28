;(function(o, undefined) {

    "use strict";
    var mask = new o.Widget.Mask({
        isScroll: true
    });
    mask.on("tap", function() {
        console.log(11111);
        mask.hidden();
    });
    var _mask = mask.clone();
    _mask.on("tap", function() {
        _mask.hidden();
    })
    o.event.on(window, "DOMContentLoaded", onLoadCompleted, false);
    function onLoadCompleted() {
        o.gesture(o.g("global_mask")).on("tap", function() {
            mask.active ? mask.show() : mask.render();
        });
        o.gesture(o.g("container_mask")).on("tap", function() {
            _mask.active ? _mask.show() : _mask.render(o.g("mask_container"));
        });
    }
})(octopus);
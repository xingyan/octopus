;(function(o, undefined) {

    "use strict";

    /**
     * @param animation {String} 具体支持动画类型 请见<octopus.Widget.Mask>
     * @type {o.Widget.Mask}
     */
    var mask = new o.Widget.Mask({
        isScroll: false,
        animation: "slideUp"
    });

    mask.on("tap", function() {
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
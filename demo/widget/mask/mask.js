;(function(o, undefined) {

    "use strict";

    /**
     * @param animation {String} 具体支持动画类型 请见<octopus.Widget.Mask>
     * @type {o.Widget.Mask}
     */
    var mask = new o.Widget.Mask({
        isScroll: false,
        animation: "scale"
    });

    mask.on("tap", function() {
        mask.hidden();
    });

    var _mask = mask.clone();

    _mask.on("tap", function() {
        _mask.hidden();
    })

    o.event.on(window, "ready", onLoadCompleted, false);

    function onLoadCompleted() {
        o.gesture(o.g("global_mask")).on("tap", function(e) {
            var pos = o.dom.getPosition(this);
            mask.active ? mask.show(pos) : mask.render(document.body, false, pos);
        });
        var dom = $("#mask_container")[0];
        o.gesture(o.g("container_mask")).on("tap", function(e) {
            var pos = o.dom.getPosition(this),
                _pos = o.dom.getPosition(dom),
                __pos = {top: (pos.top - _pos.top), left: (pos.left - _pos.left)};
            _mask.active ? _mask.show(__pos) : _mask.render(o.g("mask_container"), false, __pos);
        });
    }
})(octopus);
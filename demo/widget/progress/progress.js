(function(o, undefined) {

    "use strict";

    var progress = new o.Widget.Progress();

    o.event.on(window, "ready", onCompleted, false);

    function onCompleted() {
        progress.render("progress_container");
        o.gesture(o.g("load_auto")).on("tap", onAutoSelect);
        o.gesture(o.g("load_trick")).on("tap", onTrick);
        o.gesture(o.g("load_stop")).on("tap", onStop);
        o.event.on(o.g("load_value"), "change", onSelect, false);
    }

    function onAutoSelect() {
        progress.goTo({
            value: 100,
            type: "animation"
        });
    }

    function onStop() {
        progress.stop();
    }

    function onFinish() {
        progress.goBack();
    }

    function onTrick() {
        progress.passTrick();
    }

    function onSelect(e) {
        progress.goTo({
            value: e.target.value,
            duration: 2,
            type: "animation"
        });
    }

})(octopus);
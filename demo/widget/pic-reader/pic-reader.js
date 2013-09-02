(function(o, undefined) {

    "use strict";

    o.event.on(document, "ready", onReady, false);

    var reader;

    function onReady() {
        reader = new o.Widget.PicReader({
            imgEl: "pic-reader_container",
            hasGizmos: true
        });
        reader.on("tap", function(e) {
            o.event.stop(e);
            window.setTimeout(function() {
                reader.hidden();
            }, 300);
        });
    }

})(octopus);
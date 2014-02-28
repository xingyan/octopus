(function(o, undefined) {
    "use strict";

    var manager = o.widgetManager("back2top_container");

    manager.init();

    var widget = manager.getWidgetById("test_back2top");
    widget.on("back2top-ontap", function(data) {
        console.log(data);
    });

})(octopus);
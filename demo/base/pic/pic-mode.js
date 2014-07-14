(function(o, undefined) {

    "use strict";

    var manager = o.widgetManager(document.body);

    manager.init();
    /*
    var widgets = manager.getWidgetByClass("octopus.Widget.HtmlSlider");
    o.util.each(widgets, function(item) {
        item.on("slider-item-ontap", function(data) {
            console.log(data);
        })
    });
    */
})(octopus);
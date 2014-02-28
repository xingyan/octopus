(function(o, undefined) {

    "use strict";

    o.app.registerModule("Layers", function(app) {

        function initialize() {
            app.on("octopus-menu-toogle", toggleLayer);
        }


        function toggleLayer() {
            var layer = app.currentLayer;
            if(layer) {
                layer.checkSize();
            }
        }

        return {
            initialize: initialize
        }
    });

})(octopus);


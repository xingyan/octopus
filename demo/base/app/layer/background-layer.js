(function(o, undefined) {

    "use strict";

    o.Layer.BackLayer = o.define(o.Layer, {

        themes: "image",

        background: null,

        isBaseLayer: true,

        initialize: function() {
            o.Layer.prototype.initialize.apply(this, arguments);
            console.log(this.CLASS_NAME)
            this.initBackground();
        },

        initBackground: function() {
            this.background = this.background || {
                color: "linear-gradient( rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),",
                url: "resources/img/bk/bck-03.jpg",
                position: "center center",
                repeat: "repeat",
                backgroundSize: "cover"
            };
            this.updateBackground(this.background);
        },

        /**
         * Method: updateBackground
         * 设置背景图层
         * Parameters:
         * back	-	{String或者Object}
         */
        updateBackground: function(back) {
            if(typeof back == "string") {
                this.el.style.background = back;
            } else {
                var color = back.color,
                    url = back.url,
                    position = back.position,
                    repeat = back.repeat,
                    backgroundSize = back.backgroundSize;
                var that = this;
                o.util.loadImage(url, function() {
                    that.el.style.background = color + " url('" + url + "') " + position + " " + repeat;
                    that.el.style.backgroundSize = backgroundSize;
                });
            }
        },

        CLASS_NAME: "octopus.Layer.BackLayer"
    });

})(octopus);
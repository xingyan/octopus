(function(o, undefined) {

    "use strict";

    o.Layer.ContactLayer = o.define(o.Layer, {

        api: "http://api.map.baidu.com/getscript?v=2.0&ak=281a054d7ed2e25448d6f5a15bf5ac3f",

        map: null,

        mapEl: null,

        adEl: null,

        contactEl: null,

        inner: "<div class='octopusdemo-contact-adhead'>联系我们</div><div class='octopusdemo-contact-body'>" +
            "<div>联系电话：#{tel}</div><div>传真：#{fax}</div><div>地址：#{address}</div></div>",

        initialize: function() {
            o.Layer.prototype.initialize.apply(this, arguments);
            var s = o.dom.createDom("script", {
                src: this.api
            });
            this.data = this.config.data || this.data;
            this.buildSelf();
            o.one("head").appendChild(s);
        },

        buildSelf: function() {
            var container = o.dom.createDom("div", {
                "class": "octopusdemo-contact-container"
            });
            this.mapEl = o.dom.createDom("div", {
                "class": "octopusdemo-contact-map"
            });
            this.adEl = this.buildAdel();
            container.appendChild(this.mapEl);
            container.appendChild(this.adEl);
            this.el.appendChild(container);
        },

        buildAdel: function() {
            var dom = o.dom.createDom("div", {
                "class": "octopusdemo-contact-ad"
            });
            this.contactEl = o.dom.createDom("div", {
                "class": "octopusdemo-contact-info"
            });
            dom.appendChild(this.contactEl);
            return dom;
        },

        buildMap: function() {
            this.map = new BMap.Map(this.mapEl);
            this.contactEl.innerHTML = o.util.format(this.inner, this.data[0]);
        },

        activate: function() {
            o.Layer.prototype.activate.apply(this, arguments);
            if(!this.map) {
                this.buildMap();
            }
            var local = new BMap.LocalSearch(this.map),
                that = this;
            local.search("北京市朝阳区朝外大街乙6号朝外SOHO");
            local.setSearchCompleteCallback(function(data) {
                console.log(data);
                var d = data.Pl[0],
                    p = d.point,
                    maker = new BMap.Marker(p);
                maker.setTitle("北京市朝阳区朝外大街乙6号朝外SOHO");
                that.map.centerAndZoom(p, 17);
                that.map.addOverlay(maker);
            });
            o.animation.fade(this.el, {
                out: false
            });
        },

        deactivate: function() {
            o.Layer.prototype.deactivate.apply(this, arguments);
            o.animation.fade(this.el);
        },

        CLASS_NAME: "octopus.Layer.ContactLayer"
    });

})(octopus);
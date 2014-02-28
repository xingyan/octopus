(function(o, undefined) {

    "use strict";

    o.Layer.DemoSelectedLayer = o.define(o.Layer, {

        data: null,

        lidoms: null,

        viewDom: null,

        MAX_WIDTH: 430,

        MAX_HEIGHT: 320,

        containerWidth: null,

        containerHeight: null,

        isWidthChanged: false,

        initEvent: false,

        currentDom: null,

        mousePos: null,

        iw: 0,

        ih: 0,

        initialize: function() {
            o.Layer.prototype.initialize.apply(this, arguments);
            o.dom.addClass(this.el, "octopuslayer-demoselect");
            this.data = this.config.data || this.data;
            this.initEvent = this.config.initEvent || this.initEvent;
            this.lidoms = [];
            this.buildDoms();
            this.mousePos = {
                x: 0,
                y: 0,
                preX: 0,
                preY: 0
            };
        },

        buildDoms: function() {
            if(!this.data) return;
            this.viewDom = o.dom.createDom("ul");
            this.viewDom.appendChild(this.buildItems());
            this.el.appendChild(this.viewDom);
        },

        buildItems: function() {
            var frag = document.createDocumentFragment(),
                len = this.data.length,
                i = 0;
            for(; i < len; i++) {
                var data = o.util.clone(this.data[i]),
                    li = o.dom.createDom("li", {
                        "data-id": data.id
                    }),
                    img = o.dom.createDom("img", {
                        "src": data.src
                    }),
                    hover = o.dom.createDom("div", {
                        "class": "demoselect-hover-mask"
                    }),
                    title = o.dom.createDom("span", {
                        "innerText": data.title,
                        "class": "demoselect-title"
                    });
                hover.appendChild(title);
                li.appendChild(img);
                li.appendChild(hover);
                var that = this;
                o.event.on(li, "click", function() {
                    var id = o.dom.data(this, "id");
                    that.app.notify("DemoSelectedLayer-ItemOnClick", id);
                }, false);
                frag.appendChild(li);
                this.lidoms.push(li);
                this.addSlideHover(li);
            }
            return frag;
        },

        itemsOnHover: function(el, e) {
            var target = el;
            if(this.currentDom) {
                if(this.currentDom == target)   return;
                var _el = this.currentDom;
                this.currentDom = null;
                this.removeMask(_el, e);
            }
            this.addMask(target);
        },

        removeMask: function(el, e) {
            var w = this.iw,
                h = this.ih,
                hover = o.one(".demoselect-hover-mask", el),
                pos = el.getBoundingClientRect(),
                left = pos.left,
                right = left + w,
                top = pos.top,
                bottom = top + h,
                x = e.clientX,
                y = e.clientY;
            var _l = 0,
                _t = 0;
            if(x < left) {
                _l = "-100%";
            } else if(x >= right) {
                _l = "100%";
            } else if(y < top) {
                _t = "-100%";
            } else {
                _t = "100%";
            }
            setTimeout(function() {
                o.dom.setStyles(hover, {
                    "-webkit-transform": "translate3d(" + _l + ", " + _t + ", 0)"
                })
            }, 0);
        },

        addMask: function(el) {
            var w = this.iw,
                h = this.ih,
                pos = el.getBoundingClientRect(),
                hover = o.one(".demoselect-hover-mask", el),
                left = pos.left,
                right = left + w,
                top = pos.top,
                _l = 0,
                _t = 0;
            if(this.mousePos.preX < left) {
                _l = "-100%";
            } else if(this.mousePos.preX >= right) {
                _l = "100%";
            } else if(this.mousePos.preY < top) {
                _t = "-100%";
            } else {
                _t = "100%";
            }
            this.currentDom = el;
            o.dom.setStyles(hover, {
                "-webkit-transform": "translate3d(" + _l + ", " + _t + ", 0)",
                "-webkit-transition": ""
            });
            setTimeout(function() {
                o.dom.setStyles(hover, {
                    "-webkit-transform": "translate3d(0, 0, 0)",
                    "-webkit-transition": "all .2s linear"
                });
            }, 0);
        },

        addSlideHover: function(el) {
            var that = this,
                outTimer = 0;
            o.event.on(el, "mouseover", function(e) {
                if(this != e.target && e.target.tagName.toLowerCase() != "img")    return;
                that.itemsOnHover(this, e);
            }, false);
        },

        resizeSelf: function() {
            var w = this.containerWidth,
                h = this.containerHeight,
                mw = this.MAX_WIDTH,
                mh = this.MAX_HEIGHT,
                len = this.lidoms.length,
                hN = ((w / mw) | 0) + 1,
                vN = Math.ceil(len / hN),
                width = w / hN,
                height = (width * mh) / mw;
            this.viewDom.style.height = (height * vN) + "px";
            var cH = 0,
                cV = -1,
                i = 0;
            for(; i < len; i++) {
                if(cV >= hN - 1) {
                    cV = -1;
                    cH++;
                }
                cV++;
                o.dom.setStyles(this.lidoms[i], {
                    opacity: "1",
                    width: width + "px",
                    height: height + "px",
                    "-webkit-transform": "translate3d(" + ((cV * width) | 0) + "px, " + ((cH * height) | 0) + "px, 0)"
                });
            }
            this.iw = width;
            this.ih = height;
        },

        initevents: function() {
            var that = this
            o.event.on(this.el, "mousemove", function(e) {
                that.mousePos.preX = that.mousePos.x;
                that.mousePos.preY = that.mousePos.y;
                that.mousePos.x = e.clientX;
                that.mousePos.y = e.clientY;
            }, false);
        },

        setApp: function() {
            o.Layer.prototype.setApp.apply(this, arguments);
            this.app.on("Global-OctopusApp-OnWindowResize", o.util.bind(this.checkSize, this));
        },

        activate: function() {
            o.Layer.prototype.activate.apply(this, arguments);
            if(this.initEvent) {
                this.resetWH();
                this.resizeSelf();
            }
        },

        deactivate: function() {
            o.Layer.prototype.deactivate.apply(this, arguments);
            var i = this.lidoms.length;
            for(; i--; ) {
                var el = this.lidoms[i];
                o.dom.setStyles(el, {
                    "-webkit-transform": "translate3d(0, 0, 0)",
                    "opacity": 0
                });
            }
            var that = this;
            window.setTimeout(function() {
                that.viewDom.style.height = "0px";
            }, 500);
        },

        initSelf: function() {
            if(this.initEvent)  return;
            this.checkSize();
            this.initevents();
            this.initEvent = true;
        },

        checkSize: function() {
            this.resetWH();
            if(this.isWidthChanged)    return;
            this.resizeSelf();
        },

        resetWH: function() {
            var el = this.el,
                w = o.dom.getWidth(el),
                h = o.dom.getHeight(el);
            this.isWidthChanged = (this.containerWidth == w);
            this.containerWidth = w;
            this.containerHeight = h;
        },

        CLASS_NAME: "octopus.Layer.DemoSelectedLayer"
    });

})(octopus);
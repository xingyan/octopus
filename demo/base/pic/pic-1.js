/**
 * User: xingyan
 * Date: 9/27/13
 * Time: 11:57 AM
 */
(function(o, undefined) {

    "use strict";

    o.Widget.Pic = o.define(o.Widget.Slider, {

        maxW: 0,

        maxH: 0,

        lW: 0,

        lH: 0,

        scale: false,

        tempV: null,

        cTimer: null,

        cStartDragStartV: null,

        cStartDragTempV: null,

        cStartDragEndV: null,


        initialize: function() {
            o.Widget.prototype.initialize.apply(this, arguments);
            this.dataField = this.dataField || {
                title: "title",
                url: "url",
                image_url: "image_url"
            };
            this.doms = [];
            this.unloadImage = [];
            this.length = this.data.length;
            this.current = {
                index: 0,
                dom: null
            };
            this.tempV = {
                x: 0,
                y: 0
            };
            this.buildDoms(this.el);
            this.buildSlider();

            // this.el.appendChild(this.buildInfo());


            this.el.style.cssText = "width: 100%; height: 100%; position: relative; overflow: hidden;";
        },


        /*buildInfo: function() {
         var fragment = document.createDocumentFragment(),
         fragment.appendChild();
         return fragment;
         },*/


        buildDoms: function(el) {
            this.viewDiv = o.dom.createDom("div", {
                style: "position: relative; text-align: center; -webkit-transform: translate3d(0, 0, 0);" +
                    " -webkit-backface-visibility: hidden; -webkit-user-select: none; -webkit-user-drag: none;" +
                    " -webkit-transition: -webkit-transform 0ms " + this.animationType + ";",
                "class": "octopusui-slider-view"
            });
        },

        buildDefaultSlider: function() {
            var len = this.data.length;
            if(!!!len) throw new Error("Require data of image!");
            var i = 0,
                fragment = document.createDocumentFragment();
            for(; i < len; i++) {
                var dom = this.buildSliderItem(i);
                fragment.appendChild(dom);
            }
            return fragment;
        },

        render: function() {
            o.Widget.prototype.render.apply(this, arguments);
            this.notify("slider-ui-afterrender");
        },

        activate: function() {
            o.Widget.prototype.activate.apply(this, arguments);
            this.calcSelfSize();
            if(!this.disableAll) {
                this.initSelfEvent();
            }
        },

        calcSelfSize: function() {
            this.initDomsProperty("height", "width", true);
            this.maxW = o.dom.getWidth(this.container);
            this.maxH = o.dom.getHeight(this.container);
        },



        setImageLoad: function(index, dom) {
            var url = this.getDataBy(index, "image_url");
            var _dom = o.one(".octopusui-slider-imgChildren", dom) || dom;
            o.util.loadImage(url, o.util.empty, function() {
                _dom.src = url;
                if(!o.dom.data(_dom, "pic-width")) {
                    o.dom.data(_dom, {
                        "pic-width": this.width,
                        "pic-height": this.height
                    });
                }
                o.animation.fade(_dom, {
                    out: false
                });
            }, function() {
                console.error("Image " + url + " load failed!");
            });
        },

        buildSliderItem: function(index) {
            var dom = o.dom.createDom("div", {
                    "class": "octopusui-slider-children",
                    "style": "position: relative; -webkit-transform: translate3d(0, 0, 0); overflow: hidden;"
                }),
                idom = o.dom.createDom("img", {
                    "class": "octopusui-slider-imgChildren",
                    style: "-webkit-transform: translate3d(0, 0, 0); max-width: 100%; max-height: 100%; position: absolute; left: 0; right: 0; top: 0; bottom: 0; margin: auto;"
                });
            o.gesture(idom).on("doubletap", o.util.bindAsEventListener(this.onDoubleTap, this));
            o.event.on(idom, "touchstart", o.util.bindAsEventListener(this.onScrollStart, this), false);
            o.event.on(idom, "touchmove", o.util.bindAsEventListener(this.onScrollMove, this), false);
            o.event.on(idom, "touchend", o.util.bindAsEventListener(this.onScrollEnd, this), false);
            o.event.on(idom, "touchcancel", o.util.bindAsEventListener(this.onScrollEnd, this), false);
            if((index < Math.ceil(this.loadImageNumber / 2)) ||
                index >= Math.floor(this.length - this.loadImageNumber / 2)) {
                this.setImageLoad(index, idom);
            } else {
                this.unloadImage.push({
                    index: index,
                    dom: idom
                });
            }
            dom.appendChild(idom);
            this.doms.push(dom);
            return dom;
        },

        onDoubleTap: function(e) {
            var t = e.target,
                w = o.dom.getWidth(t),
                d = o.dom.data(t, "pic-width pic-height"),
                _w = d["pic-width"];
            if(!_w || !w)   return;
            var scale = _w / w,
                p = t.parentNode,
                h = o.dom.getHeight(t),
                _h = d["pic-height"],
                zoom = o.dom.data(p, "pic-zoom");
            if(scale > 1 && !zoom) {
                this.restoreImg(t, scale, {_w: _w, _h: _h, w: w, h: h});
            } else if(zoom) {
                this.reDefaultImg(true/*t, {_w: _w, _h: _h, w: w, h: h}*/);
            }
        },

        /**
         * @private
         * @method setCurrent
         * @desc 设置当强选中的轮播
         * @param options {Object}
         */
        setCurrent: function(options) {
            if(this.current.index == options.index) return;
            /*
             var dom = this.current.dom;
             if(dom) {
             dom.style.webkitTransform = "translate3d(0, 0, 0)";
             o.dom.data(dom, {
             "pic-zoom": ""
             });
             this.scale = false;
             var img = dom.children[0];
             if(!!img) {
             img.style.webkitTransform = "translate3d(0, 0, 0)";
             this.updateV({
             x: 0,
             y: 0
             });
             img.style.maxWidth = "100%";
             img.style.maxHeight = "100%";
             o.dom.data(img, {
             "pic-width": d.w,
             "pic-height": d.h
             });
             }
             }
             */
            this.reDefaultImg();
            this.current = o.extend(this.current, options);
        },

        reDefaultImg: function(/*dom, d*/) {
            /*
             var scale = o.dom.data(dom, "pic-zoom"),
             img = dom.children[0],
             p = dom.parentNode;
             if(!!img) {
             img.style.webkitTransform = "translate3d(0, 0, 0)";
             this.updateV({
             x: 0,
             y: 0
             });
             }
             this.scale = false;
             new o.Tween(dom, ["width", "height"], [d.w, d.h], [d._w, d._h], .3, function() {
             dom.style.maxWidth = "100%";
             dom.style.maxHeight = "100%";
             o.dom.data(dom, {
             "pic-width": d.w,
             "pic-height": d.h
             });
             });
             //new o.Tween(dom, "-webkit-transform", "scale(" + scale + ")", "scale(1)", .4);
             o.dom.data(p, {
             "pic-zoom": ""
             });
             */
            var dom = this.current.dom;
            if(!dom)   return;
            //dom.style.webkitTransform = "translate3d(0, 0, 0)";
            var animate = !!arguments[0],
                img = dom.children[0];
            if(!!img) {
                img.style.webkitTransform = "translate3d(0, 0, 0)";
                this.updateV({
                    x: 0,
                    y: 0
                });
                var d = o.dom.data(img, "pic-d-width pic-d-height"),
                    w = d["pic-d-width"],
                    h = d["pic-d-height"],
                    _d = o.dom.data(img, "pic-width pic-height"),
                    _w = _d["pic-width"],
                    _h = _d["pic-height"];
                if(!w || !h || !_w || !_h)    return;
                if(animate) {
                    new o.Tween(img, ["width", "height"], [_w, _h], [w, h], .3, function() {
                        img.style.maxWidth = "100%";
                        img.style.maxHeight = "100%";
                    }, {
                        ease: "ease-out"
                    });
                } else {
                    img.style.maxWidth = "100%";
                    img.style.maxHeight = "100%";
                    img.style.width = "";
                    img.style.height = "";
                }
            }
            this.scale = false;
            o.dom.data(dom, {
                "pic-zoom": ""
            });
        },

        restoreImg: function(dom, scale, d) {
            var p = dom.parentNode;
            o.dom.data(p, {
                "pic-zoom": scale
            });
            this.scale = true;
            var event = !!this.scale ? "octopusui-pic-scale" : "octopusui-pic-normal";
            this.notify(event);
            dom.style.maxWidth = d._w + "px";
            dom.style.maxHeight = d._h + "px";
            new o.Tween(dom, ["width", "height"], [d.w, d.h], [d._w, d._h], .3, function() {
                o.dom.data(dom, {
                    "pic-d-width": d.w,
                    "pic-d-height": d.h
                });
            }, {
                ease: "ease-out"
            });
            //new o.Tween(dom, "-webkit-transform", "scale(1)", "scale(" + scale + ")", .4);
        },

        onScrollStart: function(e) {

            var touches = e.touches,
                len = touches.length;
            if(len == 1) {
                this.onSingleStart(e)
            } else if(len == 2) {
                this.onMultipleStart(e);
            }
        },

        onSingleStart: function(e) {
            var target = e.target,
                tagName = target.tagName.toLowerCase(),
                p = target.parentNode,
                scale = o.dom.data(p, "pic-zoom") || 0,
                _maxW = o.dom.data(target, "pic-width") || 0,
                _maxH = o.dom.data(target, "pic-height") || 0;
            /*
            if(tagName == "img" && !!scale) {
                /*
                if(((_maxW <= this.maxW) && (_maxH <= this.maxH))) {
                    o.Widget.Slider.prototype.onTouchStart.apply(this, arguments);
                    return;
                }
                */
                //this.lW = (_maxW - this.maxW) / (2  * scale);
                //this.lH = (_maxH - this.maxH) / (2 * scale);
            /*
            } else {
                o.Widget.Slider.prototype.onTouchStart.apply(this, arguments);
            }
            */

            var touch = e.touches[0];
            this.lW = (_maxW - this.maxW);
            this.lH = (_maxH - this.maxH) / 2;
            this.cStartDragStartV = {
                x: touch.pageX,
                y: touch.pageY
            };

        },

        onMultipleStart: function(e) {

        },

        flag: false,

        onScrollMove: function(e) {
            //o.event.stop(e, true);

            var target = e.target,
                tagName = target.tagName.toLowerCase(),
                p = target.parentNode;
            if(tagName == "img" && o.dom.data(p, "pic-zoom")) {
                var touch = e.touches[0],
                    point = {
                        x: touch.pageX,
                        y: touch.pageY
                    },

                _maxW = o.dom.data(target, "pic-width") || 0,
                _maxH = o.dom.data(target, "pic-height") || 0;
            /*
             if(tagName == "img" && !!scale) {
             /*
             if(((_maxW <= this.maxW) && (_maxH <= this.maxH))) {
             o.Widget.Slider.prototype.onTouchStart.apply(this, arguments);
             return;
             }
             */
            //this.lW = (_maxW - this.maxW) / (2  * scale);
            //this.lH = (_maxH - this.maxH) / (2 * scale);
            /*
             } else {
             o.Widget.Slider.prototype.onTouchStart.apply(this, arguments);
             }
             */


            this.lW = (_maxW - this.maxW);
            this.lH = (_maxH - this.maxH) / 2;
            var touch = e.touches[0];
            var disX = touch.pageX - this.cStartDragStartV.x,
                disY = touch.pageY - this.cStartDragStartV.y;
            this.cStartDragStartV = {
                x: touch.pageX,
                y: touch.pageY
            };
            var that = this;
            console.log("dis: ", disX);
            console.log("tempV: ", that.tempV.x);
            console.log("lw: ", that.lW);
            console.log((disX < 0 && that.tempV.x == -that.lW) || (disX >= 0 && that.tempV.x == 0));
                if((disX < 0 && that.tempV.x == -that.lW) || (disX >= 0 && that.tempV.x == 0)) {
                    this.flag = true;
                    //disX = 0;
                    this.touchStartPixelX = touch.pageX - disX;
                    this.notify("value changed", this.touchStartPixelX)
                    disX = 0;
                } else if(!this.flag) {
                    console.log("stop");
                    o.event.stop(e, true);
                } else if(this.flag) {
                    return;
                }
                console.log("start");

                if(_maxH <= that.maxH) {
                    disY = 0;
                    that.lH = 0;
                }
                if(_maxW <= that.maxW) {
                    disX = 0;
                    that.lW = 0;
                }
                var tvalue = that.tempV,
                    nvalue,
                    finalV = {
                        x: tvalue.x + disX,
                        y: tvalue.y + disY
                    };

                 if(finalV.x > 0) {
                 finalV.x = 0;
                 }
                 if(finalV.x < -that.lW) {
                 finalV.x = -that.lW;
                 }
                 if(finalV.y > that.lH) {
                 finalV.y = that.lH;
                 }
                 if(finalV.y < -that.lH) {
                 finalV.y = -that.lH;
                 }

                 if(finalV == that.tempV) {
                 return;
                 }

                nvalue = "translate3d(" + finalV.x + "px, " + finalV.y + "px, 0)";
                target.style.webkitTransform = nvalue;
                that.updateV(finalV);
            }

        },

        onScrollEnd: function(e) {
            var target = e.target,
                tagName = target.tagName.toLowerCase(),
                p = target.parentNode;
            /*
             if(tagName == "img" && o.dom.data(p, "pic-zoom")) {
             if(this.dragtimer) {
             window.clearInterval(this.dragtimer);
             this.dragtimer = null;
             }
             } else {
             }
             */
            this.flag = false;
            o.Widget.Slider.prototype.onTouchEnd.apply(this, arguments);

        },

        updateV: function(v) {
            this.tempV = v;
        },

        onClick: function(e) {
            var event = !!this.scale ? "octopusui-pic-scale" : "octopusui-pic-normal";
            this.notify(event);
        },


        onTouchStart: function(e) {

            if(this.eventTimer || this.isSlide) return;
            this.disScroll && o.event.stop(e);
            var touches = e.touches;
            if(!touches || touches.length > 1)  return;
            this.viewDiv.style.webkitTransitionDuration = "0ms";
            this.isDrag = true;
            if(this.autoPlay) {
                this.stop();
            }
            var touch = touches[0];
            var dc;
            if(this.isLon) {
                dc = touch.pageY;
            } else {
                dc = touch.pageX;
            }
            this.touchStartPixelX = touch.pageX;
            this.touchStartPixelY = touch.pageY;
            /*
             this.pageDragStartC = this.pageDragTempC = dc;
             var that = this;
             this.dragtimer = window.setInterval(function() {
             if(that.pageDragTempC == that.pageDragEndC) return;
             that.pageDragEndC = that.pageDragTempC;
             var dis = that.pageDragTempC - that.pageDragStartC;
             that.pageDragStartC = that.pageDragTempC;
             var tvalue,
             nvalue,
             otransform = that.viewDiv.style.webkitTransform;
             if(that.isLon) {
             tvalue = parseInt(otransform.replace(/translate3d\(0\S*\s/g, "")) || 0;
             nvalue = "translate3d(0, " + (tvalue + dis) + "px, 0)";
             } else {
             tvalue = parseInt(otransform.replace(/translate3d\(/g, "")) || 0;
             nvalue = "translate3d(" + (tvalue + dis) + "px, 0, 0)";
             }
             that.changeDis = that.translateValue - tvalue;
             that.viewDiv.style.webkitTransform = nvalue;
             }, 16);
             */
        },

        onTouchMove: function(e) {
            var touches = e.touches;
            if(!this.isDrag || !touches || touches.length > 1)    return;
            var touch = touches[0],
                dc = touch.pageX - this.touchStartPixelX;
            this.touchStartPixelX = touch.pageX;

            var tvalue = this.translateValue,
                nvalue = tvalue + dc,
                ntransform = "translate3d(" + nvalue + "px, 0, 0)";
            this.updateTranslateValue(nvalue);
            this.changeDis += dc;
            this.viewDiv.style.webkitTransform = ntransform;



            /*
            tvalue = parseInt(otransform.replace(/translate3d\(/g, "")) || 0;
            nvalue = "translate3d(" + (tvalue + dc) + "px, 0, 0)";
            this.changeDis = this.translateValue - tvalue;
            this.viewDiv.style.webkitTransform = nvalue;
            */
        },

        "CLASS_NAME": "octopus.Widget.Pic"
    });

    var data = [
        {image_url: "img/1.jpg"},
        {image_url: "img/2.jpg"},
        {image_url: "img/3.jpg"},
        {image_url: "img/4.jpg"},
        {image_url: "img/5.jpg"},
        {image_url: "img/6.jpg"},
        {image_url: "img/7.jpg"}
    ];
    var pic = new o.Widget.Pic({
        data: data,
        autoPlay: false
    });

    pic.render("pic_container");

})(octopus);
(function(o, undefined) {

    "use strict";

    o.Widget.Pic = o.define(o.Widget, {

        data: null,

        viewDiv: null,

        doms: null,

        animationType: "ease-out",

        unloadImage: null,

        loadImageNumber: 4,

        length: 0,

        current: null,

        tempV: null,

        springBackDis: 10,

        pageDragDirection: false,

        isSlide: false,

        animationTime: 400,

        /************************************/

        dragStartV: 0,

        tempVTranslate: 0,

        isPMove: false,

        isPDrag: false,

        changeDis: 0,

        /************************************/

        initialize: function() {
            o.Widget.prototype.initialize.apply(this, arguments);

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
            this.viewDiv = o.dom.createDom("div", {
                style: "position: relative; height: 100%; text-align: center; -webkit-transform: translate3d(0, 0, 0);" +
                    " -webkit-backface-visibility: hidden; -webkit-user-select: none; -webkit-user-drag: none;" +
                    " -webkit-transition: -webkit-transform 0ms " + this.animationType + ";",
                "class": "octopusui-slider-view"
            });
            this.buildSlider();
            this.el.style.cssText = "width: 100%; height: 100%; position: relative; overflow: hidden;";
        },

        buildSlider: function() {
            var fragment = this.buildDefaultSlider();
            this.setCurrent({
                dom: this.doms[0]
            });
            this.viewDiv.appendChild(fragment);
            this.el.appendChild(this.viewDiv);
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

        buildSliderItem: function(index) {
            var dom = o.dom.createDom("div", {
                    "class": "octopusui-slider-children"
                }, {
                    "-webkit-transform": "translate3d(0, 0, 0)",
                    "overflow": "hidden",
                    "height": "100%",
                    "position": "relative",
                    "float": "left"
                }),
                idom = o.dom.createDom("img", {
                    "class": "octopusui-slider-imgChildren",
                    style: "-webkit-transform: translate3d(0, 0, 0); max-width: 100%; max-height: 100%; position: absolute; left: 0; right: 0; top: 0; bottom: 0; margin: auto;"
                });
            o.gesture(idom).on("doubletap", o.util.bindAsEventListener(this.onDoubleTap, this));
            /*
            o.event.on(idom, "touchstart", o.util.bindAsEventListener(this.onScrollStart, this), false);
            o.event.on(idom, "touchmove", o.util.bindAsEventListener(this.onScrollMove, this), false);
            o.event.on(idom, "touchend", o.util.bindAsEventListener(this.onScrollEnd, this), false);
            o.event.on(idom, "touchcancel", o.util.bindAsEventListener(this.onScrollEnd, this), false);
            */
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

        setCurrent: function(options) {
            if(this.current.index == options.index) return;
            if(this.current.dom != null && options.dom) {
            //    this.reDefaultImg();
            }
            this.current = o.extend(this.current, options);
        },

        setImageLoad: function(index, dom) {
            var url = this.getDataBy(index, "image_url");
            var _dom = o.one(".octopusui-slider-imgChildren", dom) || dom;
            o.util.loadImage(url, o.util.empty, function() {
                _dom.src = url;
                o.animation.fade(_dom, {
                    out: false
                });
            }, function() {
                console.error("Image " + url + " load failed!");
            });
        },

        getDataBy: function(index, pro) {
            return this.data[index][pro];
        },

        render: function() {
            o.Widget.prototype.render.apply(this, arguments);
            this.notify("slider-ui-afterrender");
        },

        activate: function() {
            o.Widget.prototype.activate.apply(this, arguments);
            this.calcSelfSize();
            this.initSelfEvent();
        },

        calcSelfSize: function() {
            this.width = o.dom.getWidth(this.container);
            this.height = o.dom.getHeight(this.container);
            this.initDomsProperty();
        },

        initDomsProperty: function() {
            var len = this.length,
                _spro = this.width;
            this.viewDiv.style.width = _spro * len + "px";
            o.util.each(this.doms, function(item, i) {
                item.style.width = _spro + "px";
            });
        },

        updateV: function(t, v) {
            if(this[t] == v)    return;
            this[t] = v;
        },

        initSelfEvent: function() {
            if(this.length > 1) {
                o.event.on(this.el, "touchstart", o.util.bindAsEventListener(this.onTouchStart, this), false);
                o.event.on(this.el, "touchmove", o.util.bindAsEventListener(this.onTouchMove, this), false);
                o.event.on(this.el, "touchend", o.util.bindAsEventListener(this.onTouchEnd, this), false);
                o.event.on(this.el, "touchcancel", o.util.bindAsEventListener(this.onTouchEnd, this), false);
            }
            o.event.on(window, "ortchange", o.util.bind(this.onOrtChanged, this), false);
        },

        onOrtChanged: function() {
            this.calcSelfSize();
        //    this.select(this.current.index);
        },

        onTouchStart: function(e) {
            if(o.event.isMultiTouch(e)) return;
            var touch = e.touches[0];
            this.isPDrag = true;
            this.dragStartV = touch.pageX;
        },

        onTouchMove: function(e) {
            var that = this;
            if(o.event.isMultiTouch(e)) return;
            if(!this.isPMove) {
                window.setTimeout(function() {
                    that.calcTouchMove(e)
                }, 0);
                /*
                o.util.requestAnimation(function() {
                    that.calcTouchMove(e)
                });*/
                this.isPMove = true;
            }
        },

        calcTouchMove: function(e) {
            this.isPMove = false;
            console.log(1);
            if(!this.isPDrag)    return;
            var touch = e.touches[0],
                dc = touch.pageX - this.dragStartV;
            this.dragStartV = touch.pageX;
            var tvalue = this.tempVTranslate,
                nvalue = dc + tvalue,
                ntransform = "translate3d(" + (nvalue) + "px, 0, 0)";
            this.changeDis += dc;
            this.viewDiv.style.webkitTransform = ntransform;
            this.updateV("tempVTranslate", nvalue);
            console.log(nvalue);
        },

        onTouchEnd: function(e) {
            this.isPDrag = false;
            var target = e.target;
            if(Math.abs(this.changeDis) <= this.springBackDis) {
                this.select(this.current.index);
            } else {
                if(this.changeDis < 0 && this.current.index != this.length - 1) {
                    this.selectNext();
                } else if(this.changeDis > 0 && this.current.index != 0) {
                    this.selectPre();
                } else {
                    this.select(this.current.index);
                }
            }
            this.dragStartV = 0;
            this.changeDis = 0;
        },

        select: function(index) {
            this.isSlide = true;
            this.viewDiv.style.webkitTransitionDuration = this.animationTime + "ms";
            this.selectNoLoop(index);
            this.setCurrent({
                index: index,
                dom: this.doms[index]
            });
            if(this.unloadImage.length > 0) {
                var max = index + Math.ceil(this.loadImageNumber / 2),
                    min = Math.floor(this.loadImageNumber / 2),
                    _len = this.unloadImage.length,
                    i = _len;
                for(; i--; ) {
                    var _index = this.unloadImage[i].index;
                    if((_index < max) && !this.pageDragDirection ||
                        (index - _index) <= min && this.pageDragDirection) {
                        this.setImageLoad(_index, this.unloadImage[i].dom);
                        this.unloadImage.splice(i, 1);
                    }
                }
            }
            var that = this;
            window.setTimeout(function() {
                that.isSlide = false;
                that.notify("slider-ui-slidechange");
            }, this.animationTime);
        },

        selectNoLoop: function(index) {
            var t = 0 - (index * this.width),
                translatestr = "translate3d(" + t + "px, 0, 0)";
            this.updateV("tempVTranslate", t);
            this.viewDiv.style.webkitTransform = translatestr;
        },

        selectPre: function() {
            if(this.isSlide)    return;
            var len = this.length;
            var index = (this.current.index - 1) < 0 ? (len - 1) : this.current.index - 1;
            this.pageDragDirection = true;
            this.select(index);
        },

        selectNext: function() {
            if(this.isSlide)   return;
            var len = this.length;
            var index = (this.current.index + 1) > (len - 1) ? 0 : this.current.index + 1;
            this.pageDragDirection = false;
            this.select(index);
        },

        CLASS_NAME: "octopus.Widget.Pic"
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
        data: data
    });

    pic.render("pic_container");

})(octopus);
/**
 * @file
 * webapp通用组件基础库文件
 * 简单实现指定容器下的lazyload
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/event.js
 * @require lib/dom.js
 * @author oupeng-fe
 * @version 1.1
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @method octopus.lazyImg
     * @param opts
     */
    o.lazyImg = function(opts) {
        return new o.ImgLazyLoad(opts || {}).check();
    };

    /**
     * @class octopus.ImgLazyLoad
     * @desc 用来对指定图片或者容器内的图片进行延后加载
     * @param options 参数
     * @param options.imgs {String | Array | DOMElement} 需要延后加载的图片数组或节点或节点id
     * @param options.el {DOMElement | String} 需要延后加载的节点容器或节点容器id 如果已传入options.imgs 则此参数不生效
     * @param options.container {DOMElement | String} 出滚动条的容器
     * @param options.srcName {String} 延迟加载的图片的真实src属性字段默认为"src"
     */
    o.ImgLazyLoad = o.define({

        /**
         * @private
         * @property el
         * @type {DOMElement | String}
         * @desc 指定容器或图片
         */
        el: null,

        /**
         * @private
         * @property container
         * @type {DOMElement | String}
         * @desc 指定的滚动容器
         */
        container: null,

        /**
         * @private
         * @property imgs
         * @type {Array}
         * @desc 需要后加载的集合
         */
        imgs: null,

        /**
         * @private
         * @property srcName
         * @type {String}
         */
        srcName: "src",

        /**
         * @private
         * @property opts
         * @desc 传入的参数
         * @type {Object}
         */
        opts: null,

        /**
         * @private
         * @property isScroll
         * @type {Boolean}
         * @desc 标志位
         */
        isScroll: false,

        /**
         * @private
         * @property event
         * @type {octopus.Event}
         * @desc 自身事件
         */
        event: null,

        /**
         * @private
         * @constructor
         */
        initialize: function(options) {
            this.opts = o.extend({}, options);
            this.container = o.g(options.container) || document.body;
            var that = this,
                pnode = (this.container == document.body) ? window : this.container;
            var imgs = options.imgs;
            this.imgs = [];
            this.event = new o.Events(this);
            this.setDoms(imgs)
            o.event.on(pnode, "scroll", function() {
                if(!that.isScroll) {
                    o.util.requestAnimation(o.util.bind(that.check, that));
                    that.isScroll = true;
                }
            }, false);
            o.event.on(window, "ortchange", o.util.bind(this.reset, this), false);
        },

        /**
         * @public
         * @method octopus.ImgLazyLoad.on
         * @param evt {String} 事件监听名
         * @param func {Function} 回调函数
         * @desc 添加监听器
         */
        on: function(evt, func) {
            this.event.on(evt, func);
        },

        /**
         * @public
         * @method octopus.ImgLazyLoad.un
         * @param evt {String} 事件监听名
         * @param func {Function} 回调函数
         * @desc 卸载监听器
         */
        un: function(evt, func) {
            this.event.un(evt, func);
        },

        /**
         * @private
         * @method octopus.ImgLazyLoad.notify
         */
        notify: function(evt, opts) {
            this.event.triggerEvent(evt, opts);
        },

        /**
         * @private
         * @method setDoms
         * @desc 初始化图片节点
         */
        setDoms: function(imgs) {
            if(imgs) {
                if(o.util.isArray(imgs)) {
                    this.imgs = this.imgs.concat(imgs);
                } else {
                    var img = o.g(imgs);
                    o.util.isNode(img) && this.imgs.push(img);
                }
            } else if(this.opts.el) {
                this.el = this.el || o.g(this.opts.el);
                var _imgs = o.$("img", this.el),
                    len = _imgs.length;
                if(len > 0) {
                    var that = this;
                    o.util.each(_imgs, function(item) {
                        if(!o.util.isNode(item)) return;
                        if(!o.dom.data(item, "loaded") && o.dom.data(item, that.srcName)) {
                            that.imgs.push(item);
                        }
                    });
                } else if(this.el.tagName.toLowerCase() == "img" && !o.dom.data(this.el, "loaded") && o.dom.data(this.el, this.srcName)) {
                    this.imgs.push(this.el);
                }
            }
        },

        /**
         * @public
         * @method octopus.ImgLazyLoad.reset
         * @param imgs {String | Array | DOMELement} 新的需要加载的img 如果初始化时传入的是el 则此时不需要参数r
         * @desc 重置加载
         */
        reset: function(imgs) {
            this.setDoms(imgs);
            this.check();
        },

        /**
         * @public
         * @method octopus.ImgLazyLoad.check
         * @desc 查看当前是否符合加载条件
         */
        check: function() {
            this.isScroll = false;
            var len = this.imgs.length;
            if(len == 0)    return this;
            var t = this.container.scrollTop,
                h = o.dom.getHeight(this.container);
            if(this.container == document.body) {
                var _h = o.dom.getScreenHeight();
                h > _h && (h = _h);
            }
            var i = len;
            for(; i--; ) {
                var item = this.imgs[i];
                if(o.dom.data(item, "loaded")) {
                    this.imgs.splice(i, 1);
                    continue;
                }
                this.checkImg(item, t, h);
            }
            return this;
        },

        /**
         * @private
         * @method checkImg
         */
        checkImg: function(item, t, h) {
            var u = o.util;
            if(!u.isNode(item)) return;
            var d = o.dom,
                loaded = d.data(item, "loaded"),
                src = d.data(item, this.srcName);
            if(loaded)  return;
            var pos = d.getPosition(item),
                height = d.getHeight(item),
                top = pos.top;
            if(t >= top - h && t <= top + height + h) {
                var that = this;
                u.loadImage(src, u.empty, function() {
                    that.notify("imglazyload-core-loadimgsuccess", item);
                    d.attr(item, {
                        src: src,
                        "data-loaded": "loaded"
                    });

                }, function() {
                    that.notify("imglazyload-core-loadimgfaile", item);
                });
            }
        }
    });

})(octopus);
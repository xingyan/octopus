/**
 * @file
 * @author oupeng-fe
 * @version 0.1
 * webapp通用组件
 * slider   -   轮播图
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/dom.js
 * @require lib/event.js
 * @require widget/widget.js
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @class octopus.Widget.Slider
     * @parent octopus.Widget
     * @desc 轮播图或轮播节点
     * @param options {Object} 参数
     * @param options.data {Array} 轮播图的图片数据 如果指定了children属性 则此参数失效
     * @param options.children {Array} 需要进行轮播的节点
     * @param options.width {Number} 轮播的宽度 建议初始化赋值 可以省掉一次获取宽度的repaint
     * @param options.height {Number} 轮播的高度 建议初始化赋值
     * @param options.dataField {Object} 图片模式下 数据的解析值 默认为{ title: "title", url: "url", image_url: "image_url" }
     * @param options.isLon {Boolean} 是否纵向轮播 true为纵向 否则为横向 默认false
     * @param options.isNewTab {Boolean} 当点击轮播图的行为为默认行为跳转时生效 true为新窗口打开 false在原窗口打开 默认true
     * @param options.autoPlay {Boolean} 是否生成后进行动画 默认为true
     * @param options.autoPlayTime {Number} 轮播图动画时的停留时间 单位ms 默认为4000ms
     * @param options.animationTime {Number} 轮播图单次动画运行时间 单位ms 默认为400ms
     * @param options.animationType {String} 轮播图的动化类型 默认为"ease-out"
     * @param options.loop {Boolean} 是否是循环轮播 默认为true
     * @param options.imgZoom {Boolean} 是否缩放图片至最佳效果 默认为true
	 * @param options.hasTitle {Boolean} 是否有轮播图下方的title区域
	 * @param options.hasGizmos {Boolean} 是否有轮播图下方的选择区域
     */
    o.Widget.Slider = o.define(o.Widget, {

        /**
         * @private
         * @property data
         * @type {Array}
         * @desc 控件的数据 如果非图片类型的轮播 此参数失效
         */
        data: null,

        /**
         * @private
         * @property width
         * @type {Number}
         * @desc 每页轮播的宽度
         */
        width: null,

        /**
         * @private
         * @property height
         * @type {Number}
         * @desc 每页轮播的高度
         */
        height: null,

        /**
         * @private
         * @property children
         * @type {Array | DOMElement}
         * @desc 配置的节点轮播 则图片轮播配置失效
         */
        children: null,

        /**
         * @private
         * @property doms
         * @type {Array | DOMElement}
         * @desc 轮播图中轮播节点的集合
         */
        doms: null,

        /**
         * @private
         * @property length
         * @type {Number}
         * @desc 轮播的长度
         */
        length: 0,

        /**
         * @private
         * @property _type
         * @type {String}
         * @desc 标志位 标志是图片轮播还是节点轮播 "img" || "dom"
         */
        _type: "img",

        /**
         * @private
         * @property dataFiled
         * @type {Object}
         * @desc 图片模式下数据的读取key
         */
        dataField: null,

        /**
         * @private
         * @property viewDiv
         * @type {DOMElement}
         * @desc 轮播的载体
         */
        viewDiv: null,

        /**
         * @private
         * @property isLon
         * @type {Boolean}
         * @desc 是否纵向轮播
         */
        isLon: false,

        /**
         * @private
         * @property isNewTab
         * @type {Boolean}
         * @desc 配置项 是否点击后新窗口打开
         */
        isNewTab: true,

        /**
         * @private
         * @property isDisableA
         * @type {Boolean}
         * @desc 配置项 是否自定义点击事件
         */
        isDisableA: false,

        /**
         * @private
         * @property current
         * @type {Object}
         * @desc 当前选择的节点以及index信息
         */
        current: null,

        /**
         * @private
         * @property loadImageNumber
         * @type {Number}
         * @desc 默认一次拉取的图片个数 为负数表示一次拉取完毕
         */
        loadImageNumber: 4,

        /**
         * @private
         * @property timer
         * @type {Number}
         * @desc 轮播的timer
         */
        timer: null,

        /**
         * @private
         * @property autoPlayTime
         * @desc 轮播图留的时间
         * @type {Number}
         */
        autoPlayTime: 4000,

        /**
         * @private
         * @property animationTime
         * @desc 轮播速度
         * @type {Number}
         */
        animationTime: 400,

        /**
         * @private
         * @property animationType
         * @desc 轮播图的动画类型
         */
        animationType: "ease-out",

        /**
         * @private
         * @property disableAll
         * @type {Boolean}
         */
        disableAll: false,

        /**
         * @private
         * @property loop
         * @type {Boolean}
         * @desc 是否循环轮播
         */
        loop: true,

        /**
         * @private
         * @property autoPlay
         * @type {Boolean}
         * @desc 是否自动播放 设置为false时，需要手动打开
         */
        autoPlay: true,

        /**
         * @private
         * @property hasButton
         * @type {Boolean}
         * @desc 是否有左右两侧的button
         */
        hasButton: true,

		/**
		 * @private
		 * @property hasTitle
		 * @type {Boolean}
		 * @desc 是否具有下侧的title区域
		 */
		hasTitle: true,

		/**
		 * @private
		 * @property hasGizmos
		 * @type {Boolean}
		 * @desc 是否具有下侧的选择区域
		 */
		hasGizmos: true,

        /**
         * @private
         * @property preDom
         * @type {DOMElement}
         * @desc 上一张
         */
        preDom: null,

        /**
         * @private
         * @property nextDom
         * @type {DOMElement}
         * @desc 下一张
         */
        nextDom: null,

		/**
		 * @private
		 * @property currentGizmos
		 * @type {DOMElement}
		 * @desc 当前的小玩意
		 */
		currentGizmos: null,

		/**
		 * @private
		 * @property gizmosDoms
		 * @type {Array}
		 * @desc 选择器节点的数组
		 */
		gizmosDoms: null,

        /**
         * @private
         * @property isSlide
         * @type {Boolean}
         * @desc 标志位 标志是否正在轮播
         */
        isSlide: false,

        /**
         * @private
         * @property isDrag
         * @type {Boolean}
         * @desc 标志位 标志是否处于拖拽状态
         */
        isDrag: false,

        /**
         * @private
         * @property pageDragC
         * @type {Number}
         * @desc 拖拽点 横向与纵向分别对应x与y
         */
        pageDragStartC: 0,

        /**
         * @private
         * @property pageDragDown
         * @type {Number}
         * @desc 拖拽结束点
         */
        pageDragEndC: 0,

        /**
         * @private
         * @property pageDragTempC
         * @type {Number}
         * @desc 中间拖拽点
         */
        pageDragTempC: 0,

        /**
         * @private
         * @property pageDragDirection
         * @type {Boolean}
         * @desc 拖拽的方向 true为正向 false为正方向
         */
        pageDragDirection: false,

        /**
         * @private
         * @property dragtimer
         * @type {Number}
         * @desc 拖拽时的timer
         */
        dragtimer: null,

        /**
         * @private
         * @property translateValue
         * @type {Number}
         * @desc 轮播的位置
         */
        translateValue: 0,

        /**
         * @private
         * @property changeDis
         * @type {Number}
         * @desc 拖拽改变的距离
         */
        changeDis: 0,

        /**
         * @private
         * @property springBackDis
         * @type {Number}
         */
        springBackDis: 10,

        /**
         * @private
         * @property imgZoom
         * @type {Boolean}
         * @desc 是否缩放超大图片
         */
        imgZoom: true,

        /**
         * @private
         * @property eventTimer
         */
        eventTimer: null,

        /**
         * @private
         * @property unloadImage
         */
        unloadImage: null,

        /**
         * @private
         * @constructor octopus.Widget.Slider.initialize
         * @desc 与父类保持一致
         */
        initialize: function() {
            this.superclass.initialize.apply(this, arguments);
            this.dataField = this.dataField || {
                title: "title",
                url: "url",
                image_url: "image_url"
            };
            this.el.style.cssText = "overflow: hidden; width: 100%; height: 100%; position: relative;";
            this.doms = this.children || [];
            this.unloadImage = [];
            this.length = this.doms.length == 0 ? this.data.length : this.doms.length;
            this.current = {
                index: 0,
                dom: null
            };
            this.calcCurrent = o.util.bind(this._calcCurrent, this);
            this.viewDiv = this.viewDiv || document.createElement("div");
            this.viewDiv.className = "octopusui-slider-view";
            this.viewDiv.style.cssText = "position: relative; text-align: center; -webkit-transform: translate3d(0, 0, 0);" +
                " -webkit-backface-visibility: hidden; -webkit-user-select: none; -webkit-user-drag: none;" +
                " -webkit-transition: -webkit-transform 0ms " + this.animationType + ";";
            if(this.hasButton && !this.disableAll) {
                this.preDom = document.createElement("div");
                this.preDom.href = "";
                this.nextDom = document.createElement("div");
                this.nextDom.href = "";
                this.preDom.style.cssText = this.nextDom.style.cssText = "display: block; text-decoration: none;"
                this.preDom.className = "octopusui-slider-button octopusui-slider-prebutton";
                this.nextDom.className = "octopusui-slider-button octopusui-slider-nextbutton";
                this.selectPre = o.util.bind(this._selectPre, this);
                this.selectNext = o.util.bind(this._selectNext, this);
                this.gesture(this.preDom).on("tap", this.selectPre);
                this.gesture(this.nextDom).on("tap", this.selectNext);
                this.el.appendChild(this.preDom);
                this.el.appendChild(this.nextDom);
            }
			if(this.hasGizmos) {
				this.gizmosDoms = new Array(this.length);
				var len = this.length,
					i = 0,
					fragment = document.createDocumentFragment(),
					rodom = o.dom.createDom("div", {
						"class": "octopusui-slider-gizmos"
					});
				for(; i < len; i++) {
					var _className = "octopusui-slider-gizmositem";
					if(i == 0) {
						_className = "octopusui-slider-gizmositem octopusui-slider-currentgizmositem"
					}
					var dom = o.dom.createDom("div", {
						"class": _className
					});
					this.gizmosDoms[i] = dom;
					fragment.appendChild(dom);
				}
				this.currentGizmos = this.gizmosDoms[0];
				rodom.appendChild(fragment);
				this.el.appendChild(rodom);
			}
            this.buildSlider();
            //如果是自动渲染生成 必须传入宽度与高度 否则抛错
            if(this.autoActivate) {
                if(this.width == null || this.height == null) throw new Error("Require the Slider's width and height!");
                this.activate();
            }
        },

        /**
         * @private
         * @method setCurrent
         * @desc 设置当强选中的轮播
         * @param options {Object}
         */
        setCurrent: function(options) {
            this.current = o.extend(this.current, options);
			if(this.currentGizmos) {
				var index = this.current.index;
				if(this.currentGizmos != this.gizmosDoms[index]) {
					o.dom.removeClass(this.currentGizmos, "octopusui-slider-currentgizmositem");
					this.currentGizmos = this.gizmosDoms[index];
					o.dom.addClass(this.currentGizmos, "octopusui-slider-currentgizmositem");
				}
			}
        },

        /**
         * @private
         * @method octopus.Widget.Slider.buildSlider
         * @desc 生成初始节点结构
         */
        buildSlider: function() {
            var fragment;
            if(this.children == null) {
                fragment = this.buildDefaultSlider();
            } else {
                fragment = this.buildDomSlider();
            }
            if(this.loop) {
                var fristdom = this.doms[0].cloneNode(true),
                    firstimgdom = fristdom.querySelector("img"),
                    lastdom = this.doms[this.length - 1].cloneNode(true),
                    lastimgdom = lastdom.querySelector("img");
                if(this._type == "img") {
                    this.setImageLoad(0, fristdom);
                    this.setImageLoad(this.length - 1, lastdom);
                }
                fragment.appendChild(fristdom);
                fragment.appendChild(lastdom);
                this.doms.push(fristdom);
                this.doms.push(lastdom);
                this.length += 2;
            }
            this.setCurrent({
                dom: this.doms[0]
            });
            this.viewDiv.appendChild(fragment);
            this.el.appendChild(this.viewDiv);
        },

        /**
         * @private
         * @method buildSliderItem
         * @desc 生成轮播图的单例
         * @param index {Number}
         */
        buildSliderItem: function(index) {
            var dom = document.createElement("div");
            dom.className = "octopusui-slider-children";
            var idom = document.createElement("div"),
                __url = this.getDataBy(index, "url") || "",
                __target = this.isNewTab ? "_blank" : "_self";
            idom.className = "octopusui-slider-imgChildren";
            idom.style.cssText = "width: 100%; height: 100%; background-size: contain; background-repeat: no-repeat; background-position: center center;";
			var that = this;
            this.gesture(idom).on("tap", function() {
                if(!that.isDisableA) {
                    window.open(__url, __target)
                    return;
                }
                that.notify("slider-item-ontap", that.data[index]);
            });
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
			if(this.hasTitle) {
				var titledom = o.dom.createDom("div", {
						"class": "octopusui-slider-imgTitle"
					}),
					titlecontent = o.dom.createDom("div", {
						"class": "octopusui-slider-imgTitleContent octopusui-text-limit"
					});
				titlecontent.innerHTML = o.util.encodeHtml(this.getDataBy(index, "title"));
				titledom.appendChild(titlecontent);
				dom.appendChild(titledom);
			}
            this.doms.push(dom);
            return dom;
        },

        /**
         * @public
         * @method octopus.Widget.Slider.on
         * @desc 同Widget 值得注意的是 如果自定义监听了"slider-item-ontap"事件 默认点击轮播图打开新链接的行为将失效
         * @param type {String} 事件类型
         * @param func {Function} 事件监听函数
         */
        on: function(type, func) {
            this.superclass.on.apply(this, arguments);
            if(type == "slider-item-ontap" && !this.isDisableA) {
                this.isDisableA = true;
            }
        },

        /**
         * @private
         * @method buildDefaultSlider
         * @desc 生成图片轮播
         */
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

        /**
         * @private
         * @method setImageLoad
         * @param index {Number} 图片的index
         * @param dom {DOMELement} 图片的载体节点
         */
        setImageLoad: function(index, dom) {
            var url = this.getDataBy(index, "image_url");
            var _dom = dom.querySelector(".octopusui-slider-imgChildren") || dom;
            o.util.loadImage(url, o.util.empty, function() {
                _dom.style.backgroundImage = "url('" + url + "')";
            }, function() {
                throw new Error("Image load failed!");
            });
        },

        /**
         * @private
         * @method judgeIfLoadImage
         * @desc 判断是否load图片
         * @param index {Number} 图片的index
         * @param dom {DOMElement} 图片的载体节点
         * @param direction {Boolean} 标志位
         */
        judgeIfLoadImage: function(index, dom, direction) {
            var current = this.current;
            if(Math.abs(index - current.index) < this.loadImageNumber && !dom.__isloaded)    return true;
            if(direction) {
                if(index - current.index >= (this.length - this.loadImageNumber) && !dom.__isloaded) {
                    return true;
                }
            }
            return false;
        },


        /**
         * @private
         * @method buildDomSlider
         * @desc 生成节点轮播
         */
        buildDomSlider: function() {
            var fragment = document.createDocumentFragment(),
                len = this.doms.length,
                i = 0;
            this._type = "dom";
            for(; i < len; i++) {
                fragment.appendChild(this.doms[i]);
            }
            return fragment;
        },

        /**
         * @public
         * @method octopus.Widget.Slider.render
         * @desc 复写父类的render方法
         */
        render: function() {
            this.superclass.render.apply(this, arguments);
            if(this.autoPlay) {
                this.start();
            }
            this.notify("slider-ui-afterrender");
        },

        /**
         * @private
         * @method activate
         * @desc 轮播图生成后加入页面需要激活
         */
        activate: function() {
            this.superclass.activate.apply(this, arguments);
            this.calcSelfSize();
			o.event.on(window, "ortchange", o.util.bind(this.onOrtChanged, this), false);
            if(!this.disableAll) {
                this.initSelfEvent();
            }
        },

		/**
		 * @private
		 * @method onOrtChanged
		 */
		onOrtChanged: function() {
			this.calcSelfSize();
			this.select(this.current.index);
		},

        /**
         * @private
         * @method updateTranslateValue
         * @desc 更新轮播的位置
         * @param v {Number}
         */
        updateTranslateValue: function(v) {
            if((!v && v != 0) || this.translateValue == v)  return;
            this.translateValue = v;
        },

        /**
         * @private
         * @method calcSelfSize
         * @desc 初始化自身宽高
         */
        calcSelfSize: function() {
            this.isLon ? this.initDomsProperty("width", "height", false) : this.initDomsProperty("height", "width", true);
        },

        /**
         * @private
         * @method initDomsWidth
         * @desc 将所有dom宽度或高度设置了
         */
        initDomsProperty: function(pro, spro, isFloat) {
            var that = this,
                len = this.length;
            this.viewDiv.style[pro] = "100%";
            var _spro = o.dom["get" + spro.charAt(0).toUpperCase() + spro.substring(1)](this.el);
            this[spro]  = _spro;
            this.viewDiv.style[spro] = _spro * len + "px";
            o.util.each(this.doms, function(item, i) {
                item.style[pro] = "100%";
                item.style[spro] = _spro + "px";
				item.style.position = "relative";
				if(isFloat) {
                    item.style.float = "left";
                }
                if(i == len - 1 && that.loop) {
                    var __style = that.isLon ? "top" : "left";
                    item.style[__style] = 0 - _spro * len + "px";
                }
            });
        },

        /**
         * @private
         * @method initSelfEvent
         * @desc 给轮播图绑定事件
         */
        initSelfEvent: function() {
            var that = this;
            o.event.on(this.el, "touchstart", o.util.bindAsEventListener(this.onTouchStart, this));
            o.event.on(this.el, "touchmove", o.util.bindAsEventListener(this.onTouchMove, this));
            o.event.on(this.el, "touchend", o.util.bindAsEventListener(this.onTouchEnd, this));
            o.event.on(this.el, "touchcancel", o.util.bindAsEventListener(this.onTouchEnd, this));
        },

        /**
         * @private
         * @method onTouchStart
         * @desc 开始拖拽
         * @param e {window.event}
         */
        onTouchStart: function(e) {
            if(this.eventTimer) return;
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
        },

        /**
         * @private
         * @method onTouchMove
         * @desc 拖拽进行
         * @param e {window.event}
         */
        onTouchMove: function(e) {
            var touches = e.touches;
            if(!this.isDrag || !touches || touches.length > 1)    return;
            var touch = touches[0],
                dc;
            if(this.isLon) {
                dc = touch.pageY;
            } else {
                dc = touch.pageX;
            }
			if(this.pageDragTempC == dc)	return;
            this.pageDragTempC = dc;
        },

        /**
         * @private
         * @method onTouchEnd
         * @desc 拖拽结束
         * @param e {window.event}
         */
        onTouchEnd: function(e) {
            this.isDrag = false;
            if(this.dragtimer) {
                window.clearInterval(this.dragtimer);
                this.dragtimer = null;
            }
            var target = e.target;
            if(target == this.preDom || target == this.nextDom) return;
            var __type = this.isLon ? "height" : "width";
            this.isSlide = false;
            if(Math.abs(this.changeDis) <= this.springBackDis) {
                this.select(this.current.index);
            } else if(this.loop) {
                if(this.changeDis > 0) {
                    this._selectNext();
                } else {
                    this._selectPre();
                }
            } else if(!this.loop) {
                if(this.changeDis > 0 && this.current.index != this.length - 1) {
                    this._selectNext();
                } else if(this.changeDis < 0 && this.current.index != 0) {
                    this._selectPre();
                } else {
                    this.select(this.current.index);
                }
            }
            this.changeDis = 0;
            if(this.autoPlay) {
                this.start();
            }
        },

        /**
         * @private
         * @method getDataBy
         * @desc 把存的数据中的某项取出来
         * @param index {Number}
         * @param pro {String}
         */
        getDataBy: function(index, pro) {
            return this.data[index][this.dataField[pro]];
        },

        /**
         * @public
         * @method octopus.Widget.Slider.start
         * @desc 开始轮播
         */
        start: function() {
            this.stop();
            this.timer = window.setTimeout(this.calcCurrent, this.autoPlayTime);
        },

        /**
         * @private
         * @method _calcCurrent
         * @desc 进行轮播
         */
        _calcCurrent: function() {
            var index = this.current.index;
            var length = this.loop ? this.length - 2 : this.length;
            index = (++index == length) ? 0 : index;
            this.select(index);
            this.start();
        },

        /**
         * @public
         * @method octopus.Widget.Slider.stop
         * @desc 停止轮播
         */
        stop: function() {
            if(this.timer) {
                window.clearTimeout(this.timer);
                this.timer = null;
            }
        },

        /**
         * @public
         * @method octopus.Widget.Slider.select
         * @desc 选择第n个子节点
         * @param index {Number}
         */
        select: function(index) {
            this.isSlide = true;
            this.viewDiv.style.webkitTransitionDuration = this.animationTime + "ms";
            if(this.loop) {
                this.selectLoop(index);
            } else {
                this.selectNoLoop(index);
            }
            this.setCurrent({
                index: index,
                dom: this.doms[index]
            });
            if(this._type == "img" && this.unloadImage.length > 0) {
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
            }, this.animationTime);
        },

        /**
         * @private
         * @method selectNoLoop
         * @desc 轮播到最后再轮播回来
         * @param index {Number}
         */
        selectNoLoop: function(index) {
            var translatestr = "translate3d(";
            if(this.isLon) {
                var t = 0 - (index * this.height);
                translatestr += "0, " + t + "px, 0)";
            } else {
                var t = 0 - (index * this.width);
                translatestr += t + "px, 0, 0)";
            }
            this.updateTranslateValue(t);
            this.viewDiv.style.webkitTransform = translatestr;
        },

        /**
         * @private
         * @method selectLoop
         * @desc 循环选择
         * @param index {Number}
         */
        selectLoop: function(index) {
            var _index = this.current.index,
                len = this.length - 2,
                _typestr = "translate3d(0, 0, 0)",
                temp,
                _temp,
                __temp = temp = _temp = "translate3d(";
            if(index == _index) {
                if(this.isLon) {
                    __temp += "0, " + this.translateValue + "px, 0)";
                } else {
                    __temp += this.translateValue + "px, 0, 0)";
                }
                this.viewDiv.style.webkitTransform = __temp;
                return;
            }
            if((index == 0 && _index == (len - 1)) || (_index == 0 && index == (len - 1))) {
                var that = this;
                var onChanged = function(e) {
                    if(that.eventTimer) {
                        window.clearTimeout(that.eventTimer);
                        that.eventTimer = null;
                    }
                    o.event.stop(e);
                    o.event.un(that.viewDiv, "webkitTransitionEnd", onChanged);
                    that.viewDiv.style.webkitTransitionDuration = "0ms";
                    that.viewDiv.style.webkitTransform = _temp;
                }
                o.event.on(this.viewDiv, "webkitTransitionEnd", onChanged, false);
                if(index == 0 && _index == (len - 1)) {
                    _temp += "0, 0, 0)";
                    this.updateTranslateValue(0);
                    if(this.isLon) {
                        temp += "0, " + (0 - this.height * len) + "px, 0)";
                    } else {
                        temp += (0 - this.width * len) + "px, 0, 0)";
                    }

                } else if(index == (len - 1) && _index == 0) {
                    if(this.isLon) {
                        temp += "0, " + this.height + "px, 0)";
                        _temp += "0, " + (0 - this.height * (len - 1)) + "px, 0)";
                        this.updateTranslateValue(0 - this.height * (len - 1));
                    } else {
                        temp += this.width + "px, 0, 0)";
                        _temp += (0 - this.width * (len - 1)) + "px, 0, 0)";
                        this.updateTranslateValue(0 - this.width * (len - 1));
                    }
                }
                this.viewDiv.style.webkitTransform = temp;
                this.eventTimer = window.setTimeout(function() {
                    o.event.un(that.viewDiv, "webkitTransitionEnd", onChanged);
                    that.viewDiv.style.webkitTransitionDuration = "0ms";
                    that.viewDiv.style.webkitTransform = _temp;
                    that.eventTimer = null;
                }, this.animationTime - 50 < 0 ? 0 : this.animationTime - 50);
            } else {
                this.selectNoLoop(index);
            }
        },

        /**
         * @public
         * @method octopus.Widget.Slider._selectPre
         * @desc 选择上一张轮播图
         */
        _selectPre: function() {
            if(this.isSlide)    return;
            var len = this.loop ? this.length - 2 : this.length;
            var index = (this.current.index - 1) < 0 ? (len - 1) : this.current.index - 1;
            this.pageDragDirection = true;
            this.select(index);
        },

        /**
         * @public
         * @method octopus.Widget.Slider._selectNext
         * @desc 选择下一张轮播图
         */
        _selectNext: function() {
            if(this.isSlide)   return;
            var len = this.loop ? this.length - 2 : this.length;
            var index = (this.current.index + 1) > (len - 1) ? 0 : this.current.index + 1;
            this.pageDragDirection = false;
            this.select(index);
        },

        CLASS_NAME: "octopus.Widget.Slider"
    });
})(octopus);
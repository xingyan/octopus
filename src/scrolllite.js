/**
 * @file
 * webapp通用组件基础库文件
 * 简单实现横向纵向手写scroll功能
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/event.js
 * @author oupeng-fe
 * @version 0.1
 */
;(function(o, undefined) {

	"use strict";

	/**
	 * @class octopus.ScrollLite
	 * @desc 适用于模拟滚动条的容器 在能够用原生滚动的情况下 不推荐此用法
	 * @param options {Object} 参数
	 * @param options.el {DOMElement} 必须项 总的节点容器
	 * @param options.scrollEl {DOMElement} 必须项 被滚动的容器
	 * @param options.isLon {Boolean} 用以表明是横向滚动还是纵向滚动 默认横向滚动
	 * @param options.maxV {Number} 拖拽时偏移的最大值 默认为150
	 * @param options.distance {Number} 拖拽惯性滚动的基础数值 越大滚动越远 默认为350
	 * @param options.swipeVelocity {Number} 拖拽的判断速度 越小滚动越灵敏 默认为0.35
	 */
	o.ScrollLite = o.define({

		/**
		 * @private
		 * @property el
		 * @type {DOMElement}
		 * @desc 容器
		 */
		el: null,

		/**
		 * @private
		 * @property scrollEl
		 * @type {DOMElement}
		 * @desc 被滚动的容器
		 */
		scrollEl: null,

		/**
		 * @private
		 * @property gesture
		 * @desc <octopus.gesture>
		 */
		gesture: null,

		/**
		 * @private
		 * @property isDrag
		 * @desc 标志位 用以表明当前是否处于拖拽状态
		 * @type {Boolean}
		 */
		isDrag: false,

		/**
		 * @private
		 * @property isLon
		 * @desc 标志位 用以表明是横向滚动还是纵向滚动
		 */
		isLon: false,

		/**
		 * @private
		 * @property pageDragStartC
		 * @desc 拖拽起始坐标
		 * @type {Number}
		 */
		pageDragStartC: null,

		/**
		 * @private
		 * @property pageDragTempC
		 * @desc 拖拽变换坐标 中间变量
		 * @type {Number}
		 */
		pageDragTempC: null,

		/**
		 * @private
		 * @property pageDragEndC
		 * @desc 拖拽结束坐标
		 * @type {Number}
		 */
		pageDragEndC: null,

		/**
		 * @private
		 * @property stop
		 * @desc 标志位 用来标明定时器的启动状态
		 */
		stop: false,

		/**
		 * @private
		 * @property transformV
		 * @desc 中间变量 标明当前滚动节点的translate值
		 */
		transformV: 0,

		/**
		 * @private
		 * @property maxV
		 * @desc 偏移的最大值
		 * @type {Number}
		 */
		maxV: 150,

		/**
		 * @private
		 * @property dragDirection
		 * @desc 拖拽的方向
		 * @type {String}
		 */
		dragDirection: null,

		/**
		 * @private
		 * @property distance
		 * @desc 每次滚动的基数距离 越大 滚的越远
		 */
		distance: 350,

		/**
		 * @private
		 * @property swipeVelocity
		 * @desc 每次滚动的判断系数 越小越灵敏
		 * @type {Number}
		 */
		swipeVelocity: 0.35,


		/**
		 * @private
		 * @constructor
		 */
		initialize: function(el, scrollEl) {
			if(!el || !scrollEl) throw new Error("Illegal arguments!")
			el = o.g(el);
			scrollEl = o.g(scrollEl);
			this.scrollEl = scrollEl;
			this.el = el;
			this.gesture = o.gesture;
			el.style.overflow = "hidden";
			this.initEvent();
		},

		/**
		 * @private
		 * @method updateV
		 * @desc 更新当前维护的translate值
		 */
		updateV: function(v) {
			this.transformV = v;
		},

		/**
		 * @private
		 * @method initEvent
		 * @desc 初始化事件
		 */
		initEvent: function() {
			o.event.on(this.el, "touchstart", o.util.bindAsEventListener(this.onTouchStart, this));
			o.event.on(this.el, "touchmove", o.util.bindAsEventListener(this.onTouchMove, this));
			o.event.on(this.el, "touchend", o.util.bindAsEventListener(this.onTouchEnd, this));
			o.event.on(this.el, "touchcancel", o.util.bindAsEventListener(this.onTouchEnd, this));
			this.gesture(this.el, {
				swipe_velocity: this.swipeVelocity
			}).on("swipe", o.util.bind(this.onSwipe, this));
		},

		/**
		 * @private
		 * @method onSwipe
		 * @desc 监听手的滑动事件
		 */
		onSwipe: function(e) {
			var gesture = e.gesture,
				v = this.isLon ? gesture.velocityY : gesture.velocityX,
				direction = gesture.direction,
				dis = this.distance * v,
				that = this,
				limitV = this.isLon ? o.dom.getHeight(this.scrollEl) - o.dom.getHeight(this.el) : o.dom.getWidth(this.scrollEl) - o.dom.getWidth(this.el);
			if(this.transformV > 0 || this.transformV < -limitV)	return;
			var startV,
				endV,
				_endV,
				_v;
			if(direction == "right" || direction == "down") {
				_v = this.transformV + dis;
				endV = _v > 0 ? 0 : _v;
			} else {
				_v = this.transformV - dis;
				endV = _v < -limitV ? -limitV : _v;
			}
			if(this.isLon) {
				startV = "translate(0, " + this.transformV + "px)";
				_endV = "translate(0, " + endV + "px)";
			} else {
				startV = "translate(" + this.transformV + "px, 0)";
				_endV = "translate(" + endV + "px, 0)";
			}
			new o.Tween(this.scrollEl, "-webkit-transform", startV, _endV, .4, function() {
				that.updateV(endV);
			}, {
				ease: "ease-out"
			});
		},

		/**
		 * @private
		 * @method onTouchStart
		 * @desc 监听touchstart事件
		 * @param e {window.Event}
		 */
		onTouchStart: function(e) {
			o.event.stop(e);
			var touches = e.touches;
			if(!touches || touches.length > 1)  return;
			this.stop = false;
			this.isDrag = true;
			var touch = touches[0];
			var dc;
			if(this.isLon) {
				dc = touch.pageY;
			} else {
				dc = touch.pageX;
			}
			this.pageDragStartC = this.pageDragTempC = dc;
			o.util.requestAnimation(o.util.bind(this.onDragTimer, this));
		},

		/**
		 * @private
		 * @method onDragTimer
		 * @desc 定时器 跑啊跑
		 */
		onDragTimer: function() {
			if(this.stop) return;
			if(this.pageDragTempC == this.pageDragEndC) {
				this.pageDragStartC = this.pageDragTempC
				o.util.requestAnimation(o.util.bind(this.onDragTimer, this));
				return;
			}
			if(this.pageDragTempC > this.pageDragStartC) {
				this.dragDirection = "next";
			} else if(this.pageDragTempC < this.pageDragStartC) {
				this.dragDirection = "pre";
			}
			this.pageDragEndC = this.pageDragTempC;
			var dis = this.pageDragTempC - this.pageDragStartC;
			this.pageDragStartC = this.pageDragTempC;
			var tvalue = this.transformV,
				nvalue,
				finalv = tvalue + dis;
			if(this.dragDirection == "next") {
				if(finalv > this.maxV) {
					finalv = this.maxV;
				}
			} else {
				var limitV = this.isLon ? o.dom.getHeight(this.scrollEl) - o.dom.getHeight(this.el) : o.dom.getWidth(this.scrollEl) - o.dom.getWidth(this.el);
				if(finalv < -(this.maxV + limitV)) {
					finalv = -(this.maxV + limitV);
				}
			}
			if(this.isLon) {
				nvalue = "translate(0, " + finalv + "px)";
			} else {
				nvalue = "translate(" + finalv + "px, 0)";
			}
			this.scrollEl.style.webkitTransform = nvalue;
			this.updateV(finalv);
			o.util.requestAnimation(o.util.bind(this.onDragTimer, this));
		},

		/**
		 * @private
		 * @method onTouchMove
		 * @desc 监听touchmove事件
		 * @param e {window.Event}
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
			this.pageDragTempC = dc;
		},

		/**
		 * @private
		 * @method onTouchEnd
		 * @desc 监听touchend事件
		 * @param e {window.Event}
		 */
		onTouchEnd: function(e) {
			this.isDrag = false;
			this.stop = true;
			var limitV,
				startV,
				endV,
				_endV = 0,
				that = this;
			if(this.isLon) {
				limitV = o.dom.getHeight(this.scrollEl) - o.dom.getHeight(this.el);
				startV = "translate(0, " + this.transformV + "px)";
				endV = "translate(0, -" + limitV + "px)";
			} else {
				limitV = o.dom.getWidth(this.scrollEl) - o.dom.getWidth(this.el);
				startV = "translate(" + this.transformV + "px, 0)";
				endV = "translate(-" + limitV + "px, 0)";
			}
			if(this.transformV > 0 || this.transformV < -limitV) {
				this.transformV > 0 ? endV = "translate(0, 0)" : _endV = -limitV;
				new o.Tween(this.scrollEl, "-webkit-transform", startV, endV, .4, function() {
					that.updateV(_endV);
				}, {
					ease: "ease-out"
				});
			}
		},

		CLASS_NAME: "octopus.ScrollLite"
	});
})(octopus);
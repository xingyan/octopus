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
	 * @param options.maxV {Number} 拖拽时偏移的最大值 默认为150
	 * @param options.distance {Number} 拖拽惯性滚动的基础数值 越大滚动越远 默认为350
	 * @param options.swipeVelocity {Number} 拖拽的判断速度 越小滚动越灵敏 默认为0.4
	 * @param options.duration {Number} 拖拽的动画时长 默认为.8
	 * @param options.isTransform {Boolean} 这个参数很重要 一种是css的代码实现 另一种是js的代码实现 其间区别用用就知道
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
		 * @property tempV
		 * @desc 中间变量 标明当前滚动节点的translate值
		 */
		tempV: 0,

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
		swipeVelocity: 0.8,

	    /**
		 * @private
		 * @property duration
		 * @type {Number}
	     */
		duration: .8,

		/**
		 * @private
		 * @property isTween
		 * @type {Boolean}
		 */
		isTween: false,

		/**
		 * @private
		 * @property isTransform
		 * @type {Boolean}
		 * @desc 是否使用transform 如果不使用 则默认使用left值 性能低 操作性好
		 */
		isTransform: false,

		/**
		 * @private
		 * @property dragTween
		 * @desc 全局定时器
		 */
		dragTween: null,

		/**
		 * @private
		 * @property startTime
		 * @type {Number}
		 */
		startTime: 0,

		/**
		 * @private
		 * @property limitV
		 * @type {Number}
		 */
		limitV: null,

		/**
		 * @private
		 * @property time
		 */
		time: 0,

		/*
		 * @property touchStartPixelX
		 * @type {Number}
		 */
		touchStartPixelX: null,

		/**
		 * @private
		 * @property touchStartPixelY
		 * @type {Number}
		 */
		touchStartPixelY: null,

		/**
		 * @private
		 * @constructor
		 */
		initialize: function(options) {
			options.el = o.g(options.el);
			options.scrollEl = o.g(options.scrollEl);
			o.extend(this, options);
			var el = options.el,
				scrollEl = options.scrollEl;
			if(!el || !scrollEl) throw new Error("Illegal arguments!")
			this.gesture = o.gesture;
			el.style.overflow = "hidden";
			scrollEl.style.webkitBackfaceVisibility = "hidden";
			if(!this.isTransform) {
				scrollEl.style.position = "relative";
				if(o.dom.getStyle(el, "position") == "static") {
					el.style.position = "relative";
				}
			}
			this.initEvent();
		},

		/**
		 * @private
		 * @method updateV
		 * @desc 更新当前维护的translate值
		 */
		updateV: function(v) {
			this.tempV = v;
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
			var that = this;
			o.event.on(window, "ortchange", function() {
				if(that.tempV < -that.limitV) {
				    var v;
					if(that.isTransform) {
						v = "translate3d(-" + that.limitV + "px, 0, 0)";
						that.scrollEl.style.webkitTransform = v;
					} else {
						v = -that.limitV + "px";
						var prop = "left";
						that.scrollEl.style[prop] = v;
					}
				}
			});

			o.gesture(this.scrollEl, {
				swipe_velocity: this.swipeVelocity
			}).on("swipe", function(e) {
				that.onSwipe(e)
			})
		},

		/**
		 * @private
		 * @method onSwipe
		 * @desc 监听手的滑动事件
		 */
		onSwipe: function(e) {
			if(this.isTween)	return;
			var now = Date.now(),
				time = now - this.time;
			this.time = now;
			if(time < this.duration * 1500)	return;
			var gesture = e.gesture,
				v = gesture.velocityX,
				direction = gesture.direction,
				dis = this.distance * v,
				that = this,
				limitV = this.limitV;
			if(this.tempV > 0 || this.tempV < -limitV)	return;
			var startV,
				endV,
				_endV,
				_v;
			if(direction == "right" || direction == "down") {
				_v = this.tempV + dis;
				endV = _v > 0 ? 0 : _v;
			} else {
				_v = this.tempV - dis;
				endV = _v < -limitV ? -limitV : _v;
			}
			if(this.isTransform) {
				startV = "translate3d(" + this.tempV + "px, 0, 0px)";
				_endV = "translate3d(" + endV + "px, 0, 0px)";
				this.isTween = true;
				new o.Tween(this.scrollEl, "-webkit-transform", startV, _endV, this.duration, function() {
					that.updateV(endV);
					that.isTween = false;
				}, {
					ease: "ease-out"
				});
			} else {
				var prop = "left",
					start = { "prop": that.tempV },
					end = { "prop": endV };
				this.dragTween = new o.StepTween({
					startValue: start,
					endValue: end,
					func: {
						eachStep: o.util.bind(function(by) {
							that.scrollEl.style[prop] = by.prop + "px";
							that.updateV(by.prop);
						}, that)
					},
					duration: that.duration * 100
				});
			}
		},

		/**
		 * @private
		 * @method
		 */
		updateLimitV: function() {
			this.limitV = o.dom.getWidth(this.scrollEl) - o.dom.getWidth(this.el);
		},

		/**
		 * @private
		 * @method onTouchStart
		 * @desc 监听touchstart事件
		 * @param e {window.Event}
		 */
		onTouchStart: function(e) {
			if(this.isTween)	return;
			if(!this.limitV) {
				this.updateLimitV();
			}
			var touches = e.touches;
			if(!touches || touches.length > 1)  return;
			this.startTime = Date.now();
			this.stopDragTween();
			this.stop = false;
			this.isDrag = true;
			var touch = touches[0];
			this.touchStartPixelX = touch.pageX;
			this.touchStartPixelY = touch.pageY;
			this.pageDragStartC = this.pageDragTempC = touch.pageX;;
			var that = this;

			o.util.requestAnimation(function() {
				that.onDragTimer();
			});
		},

		/**
		 * @private
		 * @method stopDragTween
		 */
		stopDragTween: function() {
			if(this.dragTween) {
				this.dragTween.stop();
				this.dragTween = null;
			}
		},

		/**
		 * @private
		 * @method onDragTimer
		 * @desc 定时器 跑啊跑
		 */
		onDragTimer: function() {
			if(this.stop) return;
			var that = this;
			if(this.pageDragTempC == this.pageDragEndC || this.isTween) {
				this.pageDragStartC = this.pageDragTempC
				o.util.requestAnimation(function() {
					that.onDragTimer();
				});
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
			var tvalue = this.tempV,
				nvalue,
				finalv = tvalue + dis,
				changeP;

			if(this.dragDirection == "next") {
				if(finalv > this.maxV) {
					finalv = this.maxV;
				}
			} else {
				var limitV = this.limitV;
				if(finalv < -(this.maxV + limitV)) {
					finalv = -(this.maxV + limitV);
				}
			}

			if(finalv == this.tempV) {
				o.util.requestAnimation(function() {
					that.onDragTimer();
				});
				return;
			}
			if(this.isTransform) {
				changeP = "webkitTransform";
				nvalue = "translate3d(" + finalv + "px, 0, 0)";
			} else {
				nvalue = finalv + "px";
				changeP = "left";
			}
			this.scrollEl.style[changeP] = nvalue;
			this.updateV(finalv);
			o.util.requestAnimation(function() {
				that.onDragTimer();
			});
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
			var touch = touches[0];
			if(this.pageDragTempC == touch.pageX)	return;
			var pixel = {
				pageX: this.touchStartPixelX,
				pageY: this.touchStartPixelY
			}
			var angle = o.util.getDirection(pixel, touch);
			if(angle == "left" || angle == "right") {
				o.event.stop(e);
			}
			this.pageDragTempC = touch.pageX;
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
			var limitV = this.limitV,
				startV,
				endV,
				_endV = 0,
				that = this;
			if(this.isTransform) {
				startV = "translate3d(" + this.tempV + "px, 0, 0)";
				endV = "translate3d(-" + limitV + "px, 0, 0)";
			} else {
				startV = this.tempV;
				endV = -limitV;
			}
			if(this.tempV > 0 || this.tempV < -limitV) {
				if(this.isTransform) {
					this.tempV > 0 ? endV = "translate3d(0, 0, 0)" : _endV = -limitV;
					this.isTween = true;
					new o.Tween(this.scrollEl, "-webkit-transform", startV, endV, .4, function() {
						that.updateV(_endV);
						that.isTween = false;
					}, {
						ease: "ease-out"
					});
				} else {
					this.tempV > 0 ? endV = 0 : _endV = -limitV;
					this.stopDragTween();
					var prop = "left",
						start = { "prop": startV },
						end = { "prop": _endV };
					this.dragTween = new o.StepTween({
						startValue: start,
						endValue: end,
						func: {
							eachStep: o.util.bind(function(by) {
								that.scrollEl.style[prop] = by.prop + "px";
								that.updateV(by.prop);
							}, that)
						},
						duration: 50
					});
				}
			}
		},

		CLASS_NAME: "octopus.ScrollLite"
	});
})(octopus);
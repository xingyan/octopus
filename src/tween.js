/**
 * @file
 * webapp通用组件基础库文件
 * 动画部分
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/event.js
 * @author oupeng-fe
 * @version 0.1
 */
(function(o, undefined) {

    "use strict";

    /**
     * @class octopus.Tween
     * @desc 动画类，可以通过改变属性、起始值、结束值等配置让指定节点完成动态过渡
     * 注意：由于情况过于复杂 凡是改变属性是transform属性或包含transform属性的动画 只能按照css3的形式进行 默认动画类型是ease-out
     * @param el {DOMElement} 指定完成动画的节点
     * @param pro {String | Array} 待改变的属性 可为多值
     * @param startv {String | Number | Array} 起始值 如为数组 必须与改变属性一一对应 否则会抛错
     * @param endv {String | Number | Array} 结束值 具体要求同起始值
     * @param duration {Number} 动化过渡的时间 单位为秒/s
     * @param func {Function} 动画结束的回调函数
     * @param options {Object} 其他配置项 可为空 默认为js动画 动画类型为"octopus.easing."
     * @param options.ease {String | Object} 动画类 如果为字符串 则采用css3的transition动画 否则需要传入"octopus.easing.XXX"的动画对象
     * @example
     * var newtween = new Tween(el, ["width", "webkitTransform"], [64, "translate3d(0, 0, 0)"],
     *  [128, "translate3d(30px, 0, 0)"], .4, function() {
     *     console.log(Animation finished!);
     * }, {
     *     ease: "ease-out" | octopus.easing.linear.easeOut
     * });
     * @throw
     * @return {octopus.Tween}
     */
    o.Tween = o.define({

        /**
         * @private
         * @property el
         * {DOMElement}
         */
        el: null,

        /**
         * @private
         * @property propertyName
         * {String}
         */
        propertyName: null,

        /**
         * @private
         * @property startValue
         * {String}
         */
        startValue: null,

        /**
         * @private
         * @property endValue
         * {String}
         */
        endValue: null,

        /**
         * @private
         * @property duration
         * {Number}
         */
        duration: null,

        /**
         * @private
         * @property func
         * {Function}
         */
        func: null,

        /**
         * @private
         * @property ease
         * {Object}
         */
        ease: null,

        /**
         * @private
         * @property needParams
         * {Array}
         */
        needParams: null,

        /**
         * @private
         * @property paramsDics
         * {Array}
         */
        paramsDics: null,

        /**
         * @private
         * @property requestAnimation
         * {Object}
         */
        requestAnimation: null,

        /**
         * @private
         * @property colorList
         * {Array}
         */
        colorList: null,

        /**
         * @private
         * @property stopRequest
         * {Boolean}
         */
        stopRequest: true,

        /**
         * @private
         * @property vector
         * {Object}
         */
        vector: null,

        /**
         * @private
         * @property prefix
         * {String}
         */
        prefix: null,

        /**
         * @private
         * @property eventPrefix
         * {String}
         */
        eventPrefix: null,

        /**
         * @private
         * @property isOffCss
         * {Boolean}
         */
        isOffCss: false,

        /**
         * @private
         * @property endEvent
         * {String}
         */
        endEvent: null,

        /**
         * @private
         * @property isTransform
         * @type {Boolean}
         */
        isTransform: false,

        /**
         * @private
         * @constructor octopus.Tween
         */
        initialize: function(el, pro, startv, endv, duration, func, options) {
            if(!o.util.isNode(el))    throw new Error("require a node!");
            o.extend(this, options);
            this.el = el;
            this.propertyName = pro;
            this.startValue = startv;
            this.endValue = endv;
            this.duration = duration;
            this.func = func || o.util.void;
            this.needParams = [];
            this.colorList = [];
            this.paramsDics = ["width", "height", "left", "top", "right", "bottom", "padding",
                "padding-left", "padding-top", "padding-bottom", "padding-right", "margin",
                "margin-left", "margin-top", "margin-bottom", "margin-right", "font-size",
                "background-position", "line-height", "border-width", "border-left-width",
                "border-top-width", "border-right-width", "border-bottom-width"];
            var legality = this.check();
            this.ease = this.ease || (this.isTransform ? "ease-out" : o.easing.linear.easeOut);
            if(!legality) throw new Error("Illegal arguments!");
            if(o.util.isObject(this.ease) && !this.isTransform) {
                this.requestAnimation = o.util.requestAnimation;
                this.executeWithJs();
            } else {
                this.vector = {"" : "", Webkit: "webkit", Moz: "", O: "o", ms: "MS"};
                for(var k in this.vector) {
                    if (this.el.style[k + "TransitionProperty"] !== undefined) {
                        this.prefix = '-' + k.toLowerCase() + '-'
                        this.eventPrefix = this.vector[k]
                        break;
                    }
                }
                this.isOffCss = (this.eventPrefix == null && this.el.style.transitionProperty == undefined);
                this.endEvent = this.eventPrefix ? this.eventPrefix + "TransitionEnd" : "transitionEnd";
                this.executeWithCss();
            }

        },

        /**
         * @private
         * @method check
         * @desc 检查参数是否ok
         */
        check: function() {
            var queue = o.util.isArray(this.propertyName) &&
                    o.util.isArray(this.startValue) && o.util.isArray(this.endValue),
                pass = false,
                _pass;
            if(!queue){
                this.propertyName = [this.propertyName];
                this.startValue = [this.startValue];
                this.endValue = [this.endValue];
            }
            var paramsMatch = (this.propertyName.length == this.startValue.length) &&
                    (this.startValue.length == this.endValue.length);
            if(paramsMatch) {
                var unOk = false,
                    len = this.propertyName.length,
                    i = len;
                for(; i--; ) {
                    _pass = this.checkValue(this.propertyName[i], this.startValue[i], this.endValue[i]);
                    if(!_pass) {
                        unOk = true;
                    }
                    this.needParams[i] = this.paramsDics.indexOf(this.propertyName[i]) != -1;
                    var isColor = new RegExp("/color|background-color|border-color/i").test(this.propertyName[i]);
                    this.colorList[i] = {
                        isColor: isColor,
                        startValue: isColor ? this.getColor(this.startValue[i]) : null,
                        endValue: isColor ? this.getColor(this.endValue[i]) : null
                    };
                }
                pass = !unOk && !isNaN(this.duration);
            } else {
                pass = false;
            }
            return pass;
        },

        /**
         * @private
         * @method checkValue
         * @desc 验证值是否合法
         */
        checkValue: function(propertyName, startValue, endValue){
            var pass = false;
            if(/transform/i.test(propertyName) || /-webkit-/i.test(propertyName)) {
                this.isTransform = true;
                pass = !!startValue && o.util.isString(startValue) && !!endValue && o.util.isString(endValue)
            } else if(propertyName.indexOf('color') != -1) {
                var reg = /(^\s*)|(\s*$)/g;
                pass = !!startValue && startValue.replace(reg, '') != '' && !! endValue && endValue.replace(reg, '') != ''
            } else {
                pass = !isNaN(startValue) && !isNaN(endValue);
            }
            return pass;
        },

        /**
         * @private
         * @method getColor
         */
        getColor: function(str) {
            str = str.replace(/(^\s*)|(\s*$)/g, '');
            var rgbReg = /^\s*rgb\s*\(\s*\d{1,3}\s*\,\s*\d{1,3}\s*\,\s*\d{1,3}\s*\)\s*$/i;
            var sixRegA = /^\s*\#[a-zA-Z0-9]{3}\s*$/;
            var sixRegB = /^\s*\#[a-zA-Z0-9]{6}\s*$/;
            var arr = [];
            if(rgbReg.test(str)){ // 以RGB形式指定的颜色
                var nStr = str.split('(')[1].split(')')[0].split(',');
                for(var i = 0 ; i < nStr.length ; i ++){
                    arr.push(nStr[i] / 1);
                }
                return arr;
            }
            if(sixRegB.test(str)) { // 以16进制指定颜色 (6位)
                var m = str.replace('#', '').match(/(\w|\d){2}/g);

                for(var i = 0 ; i < m.length; i ++){
                    arr.push(Number('0x' + m[i]).toString(10) / 1);
                }
                return arr;
            }
            if(sixRegA.test(str)){ // 以16进制指定颜色(3位)
                var cArr = str.replace('#', '').split('');
                for(var i = 0 ; i < cArr.length ; i ++){
                    arr.push(Number('0x' + (cArr[i] + cArr[i])).toString(10) / 1);
                }
                return arr;
            }
            return null;
        },

        /**
         * @private
         * @method executeWithJs
         * 执行
         */
        executeWithJs: function() {
            this.stopRequest = false;
            var that = this,
                curTime = 0;
            var animate = function() {
                if(!that.el || that.stopRequest){
                    that.stop();
                    return;
                }
                that.getSetValue(curTime, false);
                if(curTime >= that.duration * 1000){
                    that.getSetValue(null, true);

                    that.func && that.func();
                    that.el = null;
                    return;
                }
                curTime += 16;
                that.requestAnimation(animate);
            }
            this.requestAnimation(animate, this.el);
        },

        /**
         * @private
         * @method executeWithCss
         */
        executeWithCss: function() {
            if(this.isOffCss) this.duration = 0;
            var i = 0,
                proarr = this.propertyName,
                len = proarr.length,
                _prefix = this.prefix + "transition";
            this.el.style[_prefix] = "";
            for(; i < len; i++) {
                var curValue = this.startValue[i];
                this.el.style[proarr[i]] = this.getValue(curValue, i);
            }
            var transitionArr = [],
                that = this;
            o.event.on(this.el, this.endEvent, o.util.bindAsEventListener(this.onEndEventCompleted, this))
            window.setTimeout(function() {
                var j = 0;
                for(; j < len; j++) {
                    transitionArr.push(proarr[j] + ' ' + that.duration + 's ' + that.ease);
                }
                that.el.style[_prefix] = transitionArr.join(", ");
                var _this = that;
                setTimeout(function() {
                    var z = 0;
                    for(; z < len; z++) {
                        var curValue = _this.endValue[z];
                        _this.el.style[proarr[z]] = _this.getValue(curValue, z);
                    }
                }, 0);
            }, 0);
        },

        /**
         * @private
         * @method onEndEventCompleted
         */
        onEndEventCompleted: function(e) {
            if(e.target !== e.currentTarget)    return;
            o.event.stopEventObserver(this.el, this.endEvent);
            this.func && this.func();
            this.el.style[this.prefix + "transition"] = "";
        },

        /**
         * @method octopus.Tween.stop
         * @desc 停掉动画 并解脱自我
         */
        stop: function() {
            if(this.endEvent == null) {
                this.stopRequest = true;
            } else {
                this.func && this.func();
                o.event.stopEventObserver(this.el, this.endEvent);
                this.el.style[this.prefix + "transition"] = "";
            }
            this.destroy();
        },

        /**
         * @method octopus.Tween.destroy
         * @desc 看名字就知道干嘛的
         */
        destroy: function() {
            for(var k in this) {
                this[k] = null;
            }
        },

        /**
         * @private
         * @method getSetValue
         * @desc 取出当前的属性值
         * Parameters:
         * curTime  -   {Number}
         * isEnd    -   {Boolean}
         */
        getSetValue: function(curTime, isEnd) {
            var valueInfo = [],
                i = 0,
                iLen = this.propertyName.length;
            for(; i < iLen; i++) {
                var curValue;
                if(this.colorList[i].isColor) {
                    var startRR = this.colorList[i].startValue[0],
                        startGG = this.colorList[i].startValue[1],
                        startBB = this.colorList[i].startValue[2],

                        endRR = this.colorList[i].endValue[0],
                        endGG = this.colorList[i].endValue[1],
                        endBB = this.colorList[i].endValue[2];

                    var rr, gg, bb;
                    if(isEnd) {
                        rr = endRR;
                        gg = endGG;
                        bb = endBB;
                    } else {
                        rr = Math.ceil(this.ease(curTime, startRR, endRR - startRR, this.duration * 1000));
                        gg = Math.ceil(this.ease(curTime, startGG, endGG - startGG, this.duration * 1000));
                        bb = Math.ceil(this.ease(curTime, startBB, endBB - startBB, this.duration * 1000));
                    }
                    curValue = 'rgb(' + rr + ', ' + gg + ', ' + bb + ')';
                } else {
                    if(isEnd) {
                        curValue = this.endValue[i];
                    } else {
                        curValue = Math.ceil(this.ease(curTime, this.startValue[i], this.endValue[i] - this.startValue[i], this.duration * 1000));
                    }
                }
                valueInfo.push({
                    propertyName: this.propertyName[i],
                    curValue : curValue,
                    isColor: this.colorList[i].isColor
                });
            }
            this.setValue(valueInfo);

        },

        /**
         * @private
         * @method setValue
         * @desc 改变值
         */
        setValue: function(valueInfo) {
            var setInfo = {},
                needSet = false,
                i = 0,
                iLen = valueInfo.length;
            for(; i < iLen; i++) {
                var propertyName = valueInfo[i].propertyName,
                    curValue = valueInfo[i].curValue,
                    isColor = valueInfo[i].isColor;
                if(propertyName == 'opacity'){
                    curValue = curValue / 100;
                }
                if(propertyName == 'scrollLeft' || propertyName == 'scrollTop') {
                    this.el[propertyName] = this.getValue(curValue, i);
                } else {
                    setInfo[propertyName] = isColor ? curValue : this.getValue(curValue, i);
                    needSet = true;
                }
            }

            if(needSet) {
                for(var key in setInfo) {
                    this.el.style[key] = setInfo[key];
                }
            }
        },

        /**
         * @private
         * @method getValue
         * @param value    -   {String}
         * @param order    -   {number}
         */
        getValue: function(value, order){
            return this.needParams[order] ? value + 'px' : value;
        },

        CLASS_NAME: "Octopus.Tween"
    });

    /**
     * @namespace octopus.easing
     * @desc 动画方法 每个方法都包括 "easeIn" 渐快 "easeOut" 渐慢 "easeInOut" 纠结的三个值可选
     */
    o.easing = o.easing || {};

    /**
     * @name octopus.easing.linear
     * @desc 线性动画
     */
    o.easing.linear = {

        /**
         * @name octopus.easing.linear.easeIn
         * @desc 线性渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c*t/d + b;
        },

        /**
         * @name octopus.easing.linear.easeOut
         * @desc 线性渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return c*t/d + b;
        },

        /**
         * @name octopus.easing.linear.easeInOut
         * @desc 线性纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            return c*t/d + b;
        }
    };

    /**
     * @name octopus.easing.expo
     * @desc 指数曲线的缓动
     *
     */
    o.easing.expo = {

        /**
         * @property octopus.easing.expo.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },

        /**
         * @property octopus.easing.expo.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },

        /**
         * @property octopus.easing.expo.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        }
    };

    /**
     * @name octopus.easing.quad
     * @desc 二次方的缓动
     */
    o.easing.quad = {

        /**
         * @property octopus.easing.quad.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c*(t/=d)*t + b;
        },

        /**
         * @property octopus.easing.quad.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return -c *(t/=d)*(t-2) + b;
        },

        /**
         * @property octopus.easing.quad.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        }
    };

    /**
     * @name octopus.easing.back
     * @desc 在过渡范围外的一端或两端扩展动画一次，以产生从其范围外回拉的效果。
     * 通俗讲就是先向后 再向反方向
     */
    o.easing.back = {

        /**
         * @property octopus.easing.back.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b
        },

        /**
         * @property octopus.easing.back.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b
        },

        /**
         * @property octopus.easing.back.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b
        }
    };

    /**
     * @name octopus.easing.bounce
     * @desc 在过渡范围的一端或两端内添加弹跳效果。类似一个球落向地板又弹起后，几次逐渐减小的回弹运动
     */
    o.easing.bounce = {

        /**
         * @property octopus.easing.bounce.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c - o.easing.bounce.easeOut(d - t, 0, c, d) + b
        },

        /**
         * @property octopus.easing.bounce.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b
            }
        },

        /**
         * @property octopus.easing.bounce.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if (t < d / 2) return o.easing.bounce.easeIn(t * 2, 0, c, d) * .5 + b;
            else return o.easing.bounce.easeOut(t * 2 - d, 0, c, d) * .5 + c * .5 + b
        }
    };

    /**
     * @name octopus.easing.elastic
     * @desc 添加一端或两端超出过渡范围的弹性效果 其中的运动由按照指数方式衰减的正弦波来定义
     * 指数衰减的正弦曲线缓动
     */
    o.easing.elastic = {

        /**
         * @property octopus.easing.elastic.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return - (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b
        },

        /**
         * @property octopus.easing.elastic.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return (a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b)
        },

        /**
         * @property octopus.easing.elastic.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d, a, p) {
            if (t == 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * (.3 * 1.5);
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return - .5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b
        }
    };

    /**
     * @name octopus.easing.circ
     * @desc 圆形曲线的缓动
     */
    o.easing.circ = {

        /**
         * @property octopus.easing.circ.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return - c * (Math.sqrt(1 - (t /= d) * t) - 1) + b
        },

        /**
         * @property octopus.easing.circ.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b
        },

        /**
         * @property octopus.easing.circ.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return - c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b
        }
    };

    /**
     * @name octopus.easing.sine
     * @desc 正弦曲线缓动
     */
    o.easing.sine = {

        /**
         * @property octopus.easing.sine.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return - c * Math.cos(t / d * (Math.PI / 2)) + c + b
        },

        /**
         * @property octopus.easing.sine.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b
        },

        /**
         * @property octopus.easing.sine.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            return - c / 2 * (Math.cos(Math.PI * t / d) - 1) + b
        }
    };

    /**
     * @name octopus.easing.quint
     * @desc 五次方的缓动
     */
    o.easing.quint = {

        /**
         * @property octopus.easing.quint.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b
        },

        /**
         * @property octopus.easing.quint.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b
        },

        /**
         * @property octopus.easing.quint.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b
        }
    };

    /**
     * @name octopus.easing.quart
     * @desc 四次方的缓动
     */
    o.easing.quart = {

        /**
         * @property octopus.easing.quart.easeIn
         * @desc 渐快
         *
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t * t * t + b
        },

        /**
         * @property octopus.easing.quart.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return - c * ((t = t / d - 1) * t * t * t - 1) + b
        },

        /**
         * @property octopus.easing.quart.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return - c / 2 * ((t -= 2) * t * t * t - 2) + b
        }
    };

    /**
     * @name octopus.easing.cubic
     * @desc 三次方的缓动
     */
    o.easing.cubic = {

        /**
         * @property octopus.easing.cubic.easeIn
         * @desc 渐快
         * Function: easeIn
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeIn: function(t, b, c, d) {
            return c * (t /= d) * t * t + b
        },

        /**
         * @property octopus.easing.cubic.easeOut
         * @desc 渐慢
         * Function: easeOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeOut: function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b
        },

        /**
         * @property octopus.easing.cubic.easeInOut
         * @desc 纠结
         * Function: easeInOut
         *
         * Parameters:
         * t - {Float} time
         * b - {Float} beginning position
         * c - {Float} total change
         * d - {Float} duration of the transition
         */
        easeInOut: function(t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b
        }
    };

})(octopus);

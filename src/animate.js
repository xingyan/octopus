/**
 * @file
 * webapp通用组件基础库文件
 * 动画行为部分
 * @require lib/class.js
 * @require lib/util.js
 * @require lib/event.js
 * @require lib/tween.js
 * @author oupeng-fe
 * @version 0.1
 */
;(function(o, undefined) {

    "use strict";

    /**
     * @method octopus.animate
     * @param options {Object}
     * @param options.el {DOMElement} 进行动画的节点
     * @param options.type {String} 进行动画的类型
     * @param options.config {Object} 进行动画的参数
     * @return octopus.animation
     */
    o.animate = function(options) {
        return !!o.animation[options.type] ? (o.animation[options.type](options.el, options.config, options.func)) : null;
    };

    /**
     * @namespace octopus.animation
     */
    octopus.animation = octopus.animation || {

        /**
         * @method octopus.animation.slide
         */
        slide: function(el, config, func) {
            var options = o.extend({
                direction: "left",
                out: true,
                duration: .4,
                isFade: false,
                ease: "ease-out",
                isScale: false
            }, config);
            func = func || o.util.void;
            var el = el,
                out = options.out,
                currentOpacity,
                toOpacity,
                direction = options.direction,
                toX = 0,
                toY = 0,
                fromX = 0,
                fromY = 0,
                elH = o.dom.getHeight(el),
                elW = o.dom.getWidth(el),
                ps = [],
                fvs = [],
                evs = [];
            if(direction == "left" || direction == "right") {
                if(out) {
                    toX = -elW;
                } else {
                    fromX = elW;
                }
            } else if(direction == "up" || direction == "down") {
                if(out) {
                    toY = -elH;
                }
                else {
                    fromY = elH;
                }
            }
            if (direction == 'right' || direction == 'down') {
                toY *= -1;
                toX *= -1;
                fromY *= -1;
                fromX *= -1;
            }
            ps.push("-webkit-transform");
            fvs.push("translate3d(" + fromX + "px, " + fromY + "px, 0)");
            evs.push("translate3d(" + toX + "px, " + toY + "px, 0)");
            if(options.isFade) {
                toOpacity = out ? 0 : 1;
                currentOpacity = out ? 1 : 0;
                fvs.push(currentOpacity);
                evs.push(toOpacity);
                ps.push("opacity");
            }
            if(options.isScale && out) {
                var fromScale = 1,
                    toScale = 0.8;
                fvs.push("scale(" + fromScale + ")");
                evs.push("scale(" + toScale + ")");
                ps.push("-webkit-transform");
                var _index = ps.indexOf("opacity");
                if(_index == -1) {
                    ps.push("opacity");
                    evs.push(out ? 1 : 0);
                    fvs.push(out ? 0 : 1);
                } else {
                    evs[_index] = out ? 1 : 0;
                    fvs[_index] = out ? 0 : 1;
                }
            }
            return new o.Tween(el, ps, fvs, evs, options.duration, func, {
                ease: options.ease
            });
        },

        /**
         * @method octopus.animation.fade
         */
        fade: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out"
            }, config);
            func = func || o.util.void;
            var el = el,
                fromOpacity = 1,
                toOpacity = 1,
                curZ = o.dom.getStyle(el, "z-index") || 0,
                zIndex = curZ,
                out = options.out;
            if (out) {
                toOpacity = 0;
            } else {
                zIndex = Math.abs(curZ) + 1;
                fromOpacity = 0;
            }
            var fv = [fromOpacity, zIndex],
                ev = [toOpacity, zIndex];
            return new o.Tween(el, ["opacity", "z-index"], fv, ev, options.duration, func, {
                ease: options.ease
            });
        },

        /**
         * @method octopus.animation.pop
         */
        pop: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out",
                scaleOnExit: true
            }, config);
            func = func || o.util.void;
            var el = el,
                fromScale = 1,
                toScale = 1,
                fromOpacity = 1,
                toOpacity = 1,
                curZ = o.dom.getStyle(el, 'z-index') || 0,
                fromZ = curZ,
                toZ = curZ,
                out = options.out;

            if (!out) {
                fromScale = 0.01;
                fromZ = curZ + 1;
                toZ = curZ + 1;
                fromOpacity = 0;
            } else {
                if (options.scaleOnExit) {
                    toScale = 0.01;
                    toOpacity = 0;
                } else {
                    toOpacity = 0.8;
                }
            }
            var ps = ["-webkit-transform", "-webkit-transform-origin", "opacity", "z-index"],
                fvs = ["scale(" + fromScale + ")", "50% 50%", fromOpacity, fromZ],
                evs = ["scale(" + toScale + ")", "50% 50%", toOpacity, toZ];
            return new o.Tween(el, ps, fvs, evs, options.duration, func, {
                ease: options.ease
            });
        },

        /**
         * @method octopus.animation.flip
         */
        flip: function(el, config, func) {
            var options = o.extend({
                out: true,
                duration: .4,
                ease: "ease-out",
                direction: "left"
            }, config);
            func = func || o.util.void;
            var el = el,
                direction = options.direction,
                rotateProp = 'Y',
                fromScale = 1,
                toScale = 1,
                fromRotate = 0,
                out = options.out,
                toRotate = 0;

            if (out) {
                toRotate = -180;
                toScale = 0.8;
            } else {
                fromRotate = 180;
                fromScale = 0.8;
            }

            if (direction == 'up' || direction == 'down') {
                rotateProp = 'X';
            }

            if (direction == 'right' || direction == 'left') {
                toRotate *= -1;
                fromRotate *= -1;
            }
            el.style.webkitBackfaceVisibility = "hidden"
            return new o.Tween(el, "-webkit-transform", 'rotate' + rotateProp + '(' + fromRotate + 'deg) scale(' + fromScale + ')',
                'rotate' + rotateProp + '(' + toRotate + 'deg) scale(' + toScale + ')', options.duration, func, {
                ease: options.ease
            });
        },

        /**
         * @method octopus.animation.wipe
         */
        wipe: function(el, config, func) {
            var options = o.extend({
                out: true
            }, config);
            func = func || o.util.void;
            var el = el,
                curZ = o.dom.getStyle(el, "z-index") || 0,
                zIndex,
                out = options.out,
                mask = '';

            if (!out) {
                zIndex = curZ + 1;
                mask = '-webkit-gradient(linear, left bottom, right bottom, from(transparent), to(#000), color-stop(66%, #000), color-stop(33%, transparent))';
                var _width = o.dom.getWidth(el);
                el.style.webkitMaskImage = mask;
                el.style.webkitMaskSize = _width * 3 + "px" + o.dom.getHeight(el) + "px";
                el.style.zIndex = zIndex;
                return new o.Tween(el, "-webkit-mask-position-x", 0, -_width * 2 + 'px',  options.duration, func, {
                    ease: options.ease
                });
            }
            return null;
        }
    };
})(octopus);
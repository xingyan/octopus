(function(o, undefined) {

    "use strict";

    var pre = o.g("pre_button"),
        next = o.g("next_button"),
        opposite = {
            "left": "right",
            "right": "left",
            "up": "down",
            "down": "up"
        },
        animateButtons = document.querySelectorAll("input[type=button]"),
        currentDom = document.getElementsByClassName("current")[0],
        currentType = "slide",
        direction = "left",
        opDirection = "right",
        horizon = null,
        images = document.getElementsByClassName("image-item"),
        flag1 = true,
        flag2 = true,
        index = 0,
        len = images.length,
        currentImage = images[0],
        fade = o.g("fade"),
        scale = o.g("scale"),
        isFade = true,
        isScale = true;

    o.util.each(animateButtons, addEventListener);

    o.gesture(fade).on("tap", toggleFade);
    o.gesture(scale).on("tap", toggleScale);

    function toggleFade() {
        isFade = toggleSelect(this);
    }

    function toggleScale() {
        isScale = toggleSelect(this);
    }

    function toggleSelect(target) {
        if(o.dom.hasClass(target, "select")) {
            o.dom.removeClass(target, "select");
            return false;
        } else {
            o.dom.addClass(target, "select");
            return true;
        }
    }

    function addEventListener(item) {
        if(o.util.isNode(item)) {
            o.gesture(item).on("tap", selectAnimationType);
        }
    }

    function selectAnimationType() {
        var dom = this;
        if(o.dom.hasClass(this, "current")) return;
        o.dom.removeClass(currentDom, "current");
        currentDom = this;
        var value = this.value.split("-");
        currentType = value[0];
        direction = value[1] || null;
        horizon = value[2] || null;
        direction && (opDirection = opposite[direction], true);
        o.dom.addClass(currentDom, "current");
    }

    o.gesture(pre).on("tap", onImageTap)
    o.gesture(next).on("tap", onImageTap);

    function onImageTap() {
        if(!flag1 || !flag2)    return;
        flag1 = false;
        flag2 = false;
        var _direction = this == pre ? opDirection : direction;
        o.animate({
            el: currentImage,
            type: currentType,
            func: function() {
                var _el = this && this.el
                if(!_el) {
                    _el = currentImage;
                }
                o.dom.removeClass(_el, "current-image");
                resetSelf(_el);
                flag1 = true;
            },
            config: {
                direction: _direction,
                isFade: isFade,
                isScale: isScale,
                horizon: horizon
            }
        });
        index = this == pre ? (--index < 0 ? len - 1 : index)  : (++index > len - 1 ? 0 : index);
        o.dom.addClass(images[index], "current-image");
        images[index].style.zIndex = 9999;
        o.animate({
            el: images[index],
            type: currentType,
            func: function() {
                currentImage = this.el;
                resetSelf(this.el);
                flag2 = true;
            },
            config: {
                out: false,
                direction: _direction,
                isFade: isFade,
                isScale: isScale,
                horizon: horizon
            }
        });
    }

    function resetSelf(el) {
        el.style.cssText = "";
    }

})(octopus);
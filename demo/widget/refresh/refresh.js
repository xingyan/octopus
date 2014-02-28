/**
 * User: xingyan
 * Date: 6/3/13
 * Time: 12:07 PM
 */
(function(o, undefined) {

    "use strict";

    var w = "38",
        h = "38";
    var ctx = document.getCSSCanvasContext("2d", "octopusui-loading", w, h);
    var rotatorAngle = Math.PI * 2.5,
        step = Math.PI / 6;
    window.setInterval(function() {
        var radius = 9,
            lineWidth = 3,
            center = {x: w / 2, y: h / 2};
        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle ='lightgray';
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = 'gray';
        ctx.arc(center.x, center.y, radius, rotatorAngle, rotatorAngle + Math.PI * .45);
        ctx.stroke();
        rotatorAngle += step;
    }, 50);

    var freshUp = new o.Widget.Refresh({
            id: "refresh_up",
            direction: "down",
            scrollContainer: "list-container"
        }),
        freshDown = new o.Widget.Refresh({
            id: "refresh_down",
            direction: "up",
            scrollContainer: "list-container"
        });

    var timer;
    freshDown.on("refresh-ui-loadmore", function() {
        if(timer) {
            clearTimeout(timer);
            timer = null;
        }
        timer = window.setTimeout(function() {
            freshDown.rePosition();
            var iner = "<div class='list-item'>1</div><div class='list-item'>2</div>" +
                "<div class='list-item'>3</div><div class='list-item'>4</div>" +
                "<div class='list-item'>5</div>"
            var dom = document.createElement("div");
            dom.innerHTML = iner;
            var clone = o.dom.cloneNode($("#view-container")[0], true);
            clone.appendChild(dom);
            $("#view-container")[0].parentNode.replaceChild(clone, $("#view-container")[0]);

        }, 2000)
    });

    var _timer;
    freshUp.on("refresh-ui-loadmore", function() {
        if(_timer) {
            clearTimeout(_timer);
            _timer = null;
        }
        _timer = window.setTimeout(function() {
            freshUp.rePosition();
            var iner = "<div class='list-item'>5</div><div class='list-item'>4</div>" +
                "<div class='list-item'>3</div><div class='list-item'>2</div>" +
                "<div class='list-item'>1</div>"
            var dom = document.createElement("div");
            dom.innerHTML = iner;
            var clone = o.dom.cloneNode($("#view-container")[0], true);
            o.dom.insertFirst(dom, clone);
            $("#view-container")[0].parentNode.replaceChild(clone, $("#view-container")[0]);

        }, 2000)
    })

    o.event.on(window, "ready", onLoadCompleted);
    o.event.on(document, "touchmove", function(e) {
        o.event.stop(e, true);
    })
    function onLoadCompleted() {
        freshUp.render("container");
        freshDown.render("container");
    }

})(octopus);
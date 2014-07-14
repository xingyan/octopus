(function(o, undefined) {

    var lazy = o.lazyImg({
        el: "imglazyload_container"
    });

    lazy.on("imglazyload-core-loadimgsuccess", function(opts) {
        var item = opts;
        o.animate({
            el: item,
            type: "fade",
            config: {
                out: false
            }
        });
    })

    var refresh = new o.Widget.Refresh();
    refresh.render("imglazyload_container");

    var _timer = null,
        index = 4;

    refresh.on("refresh-ui-loadmore", function() {
        if(_timer) {
            clearTimeout(_timer);
            _timer = null;
        }
        _timer = window.setTimeout(function() {
            refresh.rePosition();
            var iner = "<li><img data-src='../../img/" + (++index) + ".jpg' /></li>" +
                "<li><img data-src='../../img/" + (++index) + ".jpg' /></li>" +
                "<li><img data-src='../../img/" + (++index) + ".jpg' /></li>";
            var dom = document.createElement("div");
            dom.innerHTML = iner;
            var clone = o.dom.cloneNode(o.g("view_container"), true);
            clone.appendChild(dom);
            o.g("view_container").parentNode.replaceChild(clone, o.g("view_container"));
            lazy.reset();
            if(index == 13) {
                refresh.hidden();
                refresh.maxTranslate = -1;
            }
        }, 2000)
    });

})(octopus);
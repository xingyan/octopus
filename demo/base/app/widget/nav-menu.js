(function(o, undefined) {

    "use strict";

    o.Widget.NavMenu = o.define(o.Widget, {

        data: null,

        initialize: function() {
            o.Widget.prototype.initialize.apply(this, arguments);
            if(!this.data) {
                console.error("The data is invalid!");
                return;
            }
            this.buildSelf();
        },

        buildSelf: function() {
            var menudiv = o.dom.createDom("div", {
                    "class": "navmenu-menucontent"
                }),
                bgdiv = o.dom.createDom("div", {
                    "class": "navmenu-menubg"
                }),
                menubardiv = o.dom.createDom("div", {
                    "id": "navmenu_menubar"
                }),
                menubarbgdiv = o.dom.createDom("div", {
                    "class": "navmenu-barbg"
                }),
                logodiv = o.dom.createDom("div", {
                    "class": "navmenu-log",
                    "innerHTML": "octopus"
                }),
                menucontentdiv = o.dom.createDom("div", {
                    "class": "navmenu-content"
                }),
                navbar = o.dom.createDom("div", {
                    "class": "navmenu-baron"
                });
            menucontentdiv.appendChild(this.buildMenuItem());
            menubardiv.appendChild(menubarbgdiv);
            menubardiv.appendChild(navbar);
            menudiv.appendChild(bgdiv);
            menudiv.appendChild(logodiv);
            menudiv.appendChild(menucontentdiv);
            this.el.appendChild(menudiv);
            this.el.appendChild(menubardiv);
            o.event.on(navbar, "click", o.util.bindAsEventListener(this.onToggleBar, this), false);
        },

        buildMenuItem: function() {
            var fragment = document.createDocumentFragment(),
                list = this.data,
                that = this,
                len = list.length;
            for(var i = 0; i < len; i++) {
                var _data = list[i],
                    n = _data.current == "true" ? "navmenu-menuitem-container select" : "navmenu-menuitem-container",
                    dom = o.dom.createDom("div", {
                        "class": n
                    }),
                    bgdom = o.dom.createDom("div", {
                        "class": "navmenu-menuitem-bg"
                    }),
                    textdom = o.dom.createDom("div", {
                        "class": "navmenu-menuitem-text",
                        "innerHTML": _data.title
                    });
                dom.appendChild(bgdom);
                dom.appendChild(textdom);
                if(_data.children) {
                    var _children = _data.children,
                        _len = _children.length;
                    var childrenitemdom = o.dom.createDom("div", {
                            "class": "navmenu-menuitem-plus",
                            "innerHTML": "+"
                        }),
                        childrenmenudom = o.dom.createDom("div", {
                            "class": "navmenu-menuitem-childrenmenu"
                        });
                    for(var j = 0; j < _len; j++) {
                        var _n = (j == 0 && _data.current == "true") ? "navmenu-childrenmenuitem-item select" : "navmenu-childrenmenuitem-item",
                            _childrenmenudom = o.dom.createDom("div", {
                                "class": _n
                            }),
                            _childrenmenubgdom = o.dom.createDom("div", {
                                "class": "navmenu-childrenmenuitem-bg"
                            }),
                            _childrenmenutextdom = o.dom.createDom("div", {
                                "class": "navmenu-childrenmenuitem-text",
                                "innerHTML": _children[j].title
                            });
                        _childrenmenudom.appendChild(_childrenmenubgdom);
                        _childrenmenudom.appendChild(_childrenmenutextdom);
                        childrenmenudom.appendChild(_childrenmenudom);
                        var dataattr = _children[j].link ? (o.dom.addClass(_childrenmenudom, "navmenu-link"), "link") : "id",
                            attr = {};
                        attr[dataattr] = _children[j][dataattr];
                        o.dom.data(_childrenmenudom, attr);
                        o.event.on(_childrenmenudom, "click", function(e) {
                            o.event.stop(e);
                            if(o.dom.hasClass(this, "select"))	return;
                            var domlink = o.dom.data(this, "link");
                            if(domlink) {
                                window.open(domlink, "newtab");
                                return;
                            } else {
                                that.notify("octopus-NavMenu-ItemClick", o.dom.data(this, "id"));
                            }
                            that.removeAllSelect();
                            o.dom.addClass(this, "select");
                            if(o.dom.hasClass(this.parentNode.parentNode, "select"))	return;
                            o.dom.addClass(this.parentNode.parentNode, "select");
                        }, false);
                    }
                    dom.appendChild(childrenitemdom);
                    dom.appendChild(childrenmenudom);
                    var _clonedom = childrenmenudom,
                        __len = _len;
                    (function(__clonedom, ___len) {
                        o.event.on(dom, "mouseover", function(e) {
                            o.event.stop(e);
                            __clonedom.style.height = ___len * 32 + "px";
                        }, false);
                        o.event.on(dom, "mouseout", function(e) {
                            o.event.stop(e);
                            __clonedom.style.height = "0px";
                        }, false);
                    }(_clonedom, __len));
                } else {
                    var dataattr = _data.link ? (o.dom.addClass(dom, "navmenu-link"), "link") : "id",
                        attr = {};
                    attr[dataattr] = _data[dataattr];
                    o.dom.data(dom, attr);
                    o.event.on(dom, "click", function(e) {
                        o.event.stop(e);
                        if(o.dom.hasClass(this, "select"))	return;
                        var domlink = o.dom.data(this, "link");
                        if(domlink) {
                            window.open(domlink, "newtab");
                            return;
                        } else {
                            that.notify("octopus-NavMenu-ItemClick", o.dom.data(this, "id"));
                        }
                        that.removeAllSelect();
                        o.dom.addClass(this, "select");
                    });
                }
                fragment.appendChild(dom);
            }
            return fragment;
        },

        removeAllSelect: function() {
            var doms = o.$(".select", this.el),
                i,
                len = i = doms.length;
            for( ; i--; ) {
                o.dom.removeClass(doms[i], "select")
            }
        },

        onToggleBar: function() {
            if(this.active) {
                this.deactivate();
            } else {
                this.activate();
            }
            this.notify("octopus-NavMenu-ToogleBar", this.active);
        },

        CLASS_NAME: "octopus.Widget.NavMenu"
    });

})(octopus);
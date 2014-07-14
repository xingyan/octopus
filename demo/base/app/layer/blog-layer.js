(function(o, undefined) {

    "use strict";

    o.Layer.BlogLayer = o.define(o.Layer, {

        data: null,

        initEvent: false,

        viewDom: null,

        sumEl: null,

        atEl: null,

        listEl: null,

        counterEl: null,

        contentAr: null,

        items: null,

        item: null,

        currentItem: null,

        tempScroll: 0,


        initialize: function() {
            o.Layer.prototype.initialize.apply(this, arguments);
            o.dom.addClass(this.el, "octopuslayer-bloglayer");
            this.data = this.config.data || this.data;
            this.initEvent = this.config.initEvent || this.initEvent;
            this.contentAr = [];
            this.items = {};
            this.buildDoms();
        },

        afterAdd: function() {
            o.Layer.prototype.afterAdd.apply(this, arguments);
            o.lazyImg({
                el: this.el
            }).on("imglazyload-core-loadimgsuccess", function(img) {
                if(img) {
                    o.animation.fade(img, {
                        out: false
                    });
                }
            });
        },

        buildDoms: function() {
            if(!this.data)  return;
            this.viewDom = o.dom.createDom("div", {
                "class": "octopus-bloglayer-container"
            });
            var sumEl = o.dom.createDom("div", {
                    "class": "octopus-bloglayer-summary"
                });
            this.atEl = o.dom.createDom("div", {
                "class": "octopus-bloglayer-content"
            });
            sumEl.appendChild(this.buildSummary());
            this.atEl.appendChild(this.buildArtical());
            this.viewDom.appendChild(sumEl);
            this.viewDom.appendChild(this.atEl);
            this.el.appendChild(this.viewDom);
        },

        buildSummary: function() {
            var frag = document.createDocumentFragment();
            this.sumEl = o.dom.createDom("div", {
                "class": "bloglayer-summary-container"
            });
            var titleDom = o.dom.createDom("div", {
                "class": "summary-title-holder",
                "innerHTML": this.data.title
            });
            this.sumEl.appendChild(titleDom);
            var list = this.data.list,
                len = list.length,
                _frag = document.createDocumentFragment(),
                i = 0;
            for(; i < len; i++) {
                var data = list[i];
                _frag.appendChild(this.buildToArticle(data));
            }
            this.addToArticle(_frag);
            frag.appendChild(this.sumEl);
            return frag;
        },

        addToArticle: function(dom) {
            this.sumEl.appendChild(dom);
        },

        formatTime: function(str) {
            var ar = str.split("-"),
                _str = "",
                dateT = ["年", "月", "日"];
            o.util.each(ar, function(item, index) {
                _str += item.replace(/^0/, "") + dateT[index];
            });
            return _str;

        },

        buildToArticle: function(data) {
            var frag = document.createDocumentFragment(),
                line = o.dom.createDom("div", {
                    "class": "custom-separator"
                }),
                cEl = o.dom.createDom("div", {
                    "class": "arti-item-vertical",
                    "data-id": data.id
                }),
                tEl = o.dom.createDom("div", {
                    "class": "arti-item-vertical-title",
                    "innerHTML": data.title
                }),
                timeEl = o.dom.createDom("div", {
                    "class": "arti-item-vertical-time",
                    "innerHTML": this.formatTime(data.time)
                });
            tEl.appendChild(timeEl);
            cEl.appendChild(tEl);
            if(data.imgURL) {
                var imgCEl = o.dom.createDom("div", {
                        "class": "media-holder-arti-vertical"
                    }),
                    imgEl = o.dom.createDom("img", {
                        "data-src": data.imgURL
                    });
                imgCEl.appendChild(imgEl);
                cEl.appendChild(imgCEl);
            }
            var infEl = o.dom.createDom("div", {
                    "class": "main-text-holder"
                }),
                pEl = o.dom.createDom("p");
            pEl.innerHTML = data.summary;
            infEl.appendChild(pEl);
            cEl.appendChild(infEl);
            if(data.content) {
                var rEl = o.dom.createDom("div", {
                        "class": "arti-item-vertical-read-more"
                    }),
                    sEl = o.dom.createDom("span", {
                        "innerHTML": "阅读正文"
                    }),
                    id = o.dom.data(cEl, "id");
                rEl.appendChild(sEl);
                cEl.appendChild(rEl);
                o.dom.addClass(cEl, "item-has-details");
                this.contentAr.push(id);
                var that = this;
                o.event.on(cEl, "click", function() {
                    if(id == that.currentItem)  return;
                    var p = that.sumEl.parentNode,
                        me = that;
                    that.tempScroll = that.viewDom.scrollTop;
                    o.animation.slide(p, {}, function() {
                        me.viewDom.scrollTop = 0;
                    });
                    that.showDetails(id);
                    if(that.atEl.style.display != "inline") {
                        that.atEl.style.display = "inline";
                    }
                    o.animation.slide(that.atEl, {
                        out: false
                    }, function() {
                        if(p.style.display != "none") {
                            p.style.display = "none";
                        }
                    });
                }, false);
            }
            frag.appendChild(line);
            frag.appendChild(cEl);
            return frag;
        },

        showDetails: function(id) {
            if(id == this.currentItem)  return;
            this.currentItem = id;
            var index = this.contentAr.indexOf(id);
            this.counterEl.innerHTML = (index + 1) + "/" + this.contentAr.length;
            if(this.item) {
                this.item.style.display = "none";
            }
            console.log(this.items);
            this.item = this.items[id];
            this.item.style.display = "block";

        },

        getItemById: function(id) {
            var i = this.items.length;
            for(; i--; ) {
                if(this.items[i].id = id) {
                    return this.items[i].el;
                }
            }
            return null;
        },

        buildArtical: function() {
            var len = this.contentAr.length,
                frag = document.createDocumentFragment();
            if(len >= 0) {
                this.counterEl = o.dom.createDom("div", {
                    "class": "arti-preview-counter"
                });
                var container = o.dom.createDom("div", {
                        "class": "module-arti-preview-container"
                    }),
                    tool = o.dom.createDom("div", {
                        "class": "arti-preview-controls"
                    }),
                    bt = o.dom.createDom("div", {
                        "class": "arti-preview-backward"
                    }),
                    back = o.dom.createDom("div", {
                        "class": "arti-preview-close"
                    }),
                    nt = o.dom.createDom("div", {
                        "class": "arti-preview-forward"
                    }),
                    line = o.dom.createDom("div", {
                        "class": "custom-separator"
                    });
                bt.innerHTML = "</div><div class='arti-preview-backward-sign'></div>";
                back.innerHTML = "<div class='arti-preview-close-sign'></div>";
                nt.innerHTML = "</div><div class='arti-preview-forward-sign'></div>";
                tool.appendChild(this.counterEl);
                tool.appendChild(bt);
                tool.appendChild(back);
                tool.appendChild(nt);
                container.appendChild(line);
                container.appendChild(tool);
                this.listEl = o.dom.createDom("div", {
                    "class": "octopsu-detailes-list"
                });
                container.appendChild(this.listEl);
                this.addToListEl(this.data);
                var that = this;
                o.event.on(tool, "click", function(e) {
                    var t = e.target,
                        c = t.className;
                    switch(c) {
                        case "arti-preview-backward-sign":
                        case "arti-preview-backward":
                            that.selectPreItem();
                            break;
                        case "arti-preview-forward-sign":
                        case "arti-preview-forward":
                            that.selectNextItem();
                            break;
                        case "arti-preview-close-sign":
                        case "arti-preview-close":
                            that.backToSummary();
                        default:
                            break;
                    }
                }, false);
                frag.appendChild(container);
            }
            return frag;
        },

        addToListEl: function(data) {
            var len = data.list.length,
                frag = document.createDocumentFragment(),
                i = 0;
            for(; i < len; i++) {
                var _data = data.list[i];
                if(!_data.content)  continue;
                var cEl = o.dom.createDom("div", {
                        "class": "octopus-preview-container"
                    }),
                    tEl = o.dom.createDom("div", {
                        "class": "octopus-preview-title",
                        "innerHTML": _data.title
                    });
                cEl.appendChild(tEl);
                if(_data.imgURL) {
                    var img = o.dom.createDom("img", {
                        "class": "octopus-preview-image",
                        "data-src": _data.imgURL
                    });
                    cEl.appendChild(img);
                }
                var contentEl = o.dom.createDom("div", {
                    "class": "octopus-preview-content"
                });
                contentEl.innerHTML = _data.content;
                cEl.appendChild(contentEl);
                console.log(_data);
                this.items[_data.id] = cEl;
                frag.appendChild(cEl);
            }
            this.listEl.appendChild(frag);
        },

        animationSelect: function(direction, id) {
            var that = this,
                el = this.items[id];
            o.animation.slide(this.item, {
                "isFade": true,
                "out": true,
                "direction": direction
            }, function() {
                var _el = this && this.el;
                if(!_el) {
                    _el = that.item;
                }
                _el.style.cssText = "display: none;";
                that.currentItem = id;
            });

            el.style.cssText = "display: block; z-index: 9999";
            o.animation.slide(el, {
                "isFade": true,
                "out": false,
                "direction": direction
            }, function() {
                that.item = this.el;
                this.el.style.cssText = "display: block";
            })
        },

        selectPreItem: function() {
            var index = this.contentAr.indexOf(this.currentItem);
            if(index == 0)  return;
            this.animationSelect("right", this.contentAr[index - 1]);
        },

        selectNextItem: function() {
            var index = this.contentAr.indexOf(this.currentItem);
            if(index == this.contentAr.length - 1)  return;
            this.animationSelect("left", this.contentAr[index + 1]);
        },

        backToSummary: function() {
            var p = this.sumEl.parentNode,
                that = this;
            if(p.style.display != "inline") {
                p.style.display = "inline";
            }
            this.viewDom.scrollTop = this.tempScroll;

            o.animation.slide(p, {
                direction: "right",
                out: false
            });
            o.animation.slide(that.atEl, {
                direction: "right"
            }, function() {
                if(that.atEl.style.display != "none") {
                    that.atEl.style.display = "none";
                    that.currentItem = null;
                }
            });
        },

        activate: function() {
            o.Layer.prototype.activate.apply(this, arguments);
            if(this.initEvent) {
                this.expend(true)
            }
        },

        deactivate: function() {
            o.Layer.prototype.deactivate.apply(this, arguments);
            this.expend(false);
            if(!this.currentItem)   return;
            var that = this;
            setTimeout(function() {
                that.currentItem = null;
                that.tempScroll = 0;
                o.dom.setStyles(that.sumEl.parentNode, {
                    "display": "inline",
                    "-webkit-transform": "translate3d(0, 0, 0)"
                });
                o.dom.setStyles(that.atEl, {
                    display: "none",
                    "-webkit-transform": "translate3d(100%, 0, 0)"
                });
                that.viewDom.scrollTop = 0;
            }, 500);
        },

        expend: function(b) {
            var css = b ? "translate3d(0, 0, 0)" : "translate3d(-100%, 0, 0)";
            o.dom.setStyles(this.viewDom, {
                "-webkit-transform": css
            });
        },


        initSelf: function() {
            this.initEvent = true;
        },

        setApp: function() {
            o.Layer.prototype.setApp.apply(this, arguments);
            this.app.on("Global-OctopusApp-AppCompleted", o.util.bind(this.initSelf, this));
        },

        CLASS_NAME: "octopus.Layer.BlogLayer"
    });

})(octopus);
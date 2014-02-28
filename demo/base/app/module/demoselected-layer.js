;(function(o, undefined) {

    "use strict";

    o.app.registerModule("DemoSelectedLayer", function(app) {

        var
            layer = null,

            demoLayer = null,

            demoData = null,

            demoLength = 0,

            textContainer = null,

            contextContainer = null,

            contentContainer = null,

            demoContainer = null,

            locked = false,

            innerText = "<p data-height='#{height}' data-theme-id='0' data-slug-hash='#{url}' data-user='xingyan'" +
                "data-default-tab='result' class='codepen'>See the Pen <a href='http://codepen.io/xingyan/pen/#{url}'>" +
                "#{title}</a> by Will (<a href='http://codepen.io/xingyan'>@xingyan</a>) on <a href=" +
                "'http://codepen.io'>CodePen</a></p>",

            currentDemo = null;

        function initialize() {
            app.on("Global-OctopusApp-LayerAdd", onLayerAdd);
            app.on("octopus-ChangeLayer-DataCompleted", updateData);
            app.on("DemoSelectedLayer-ItemOnClick", showDemo);
        }

        function updateData(data) {
            if(data.type == "0") {
                demoData = data.data.content;
                demoLength = demoData.length;
            }
        }

        function showDemo(id) {
            if(!demoLayer) {
                demoLayer = buidlDemoLayer();
                app.viewEl.appendChild(demoLayer);
            }
            if(currentDemo != id) {
                currentDemo = id;
                setCurrentDemo(id);
            }
            demoLayerSlideIn()
        }

        function buidlDemoLayer() {
            var dom = o.dom.createDom("div", {
                    "class": "octopusdemo-demolayer"
                }),
                header = o.dom.createDom("div", {
                    "class": "octopusdemo-demolayer-header"
                }),
                btn = o.dom.createDom("div", {
                    "class": "octopusdemo-demolayer-btn",
                    "innerText": "关闭"
                }),
                prebtn = o.dom.createDom("div", {
                    "class": "octopusdemo-demolayer-btn",
                    "innerText": "上一个"
                }),
                nextbtn = o.dom.createDom("div", {
                    "class": "octopusdemo-demolayer-btn",
                    "innerText": "下一个"
                }),
                code = o.dom.createDom("code", {
                    "class": "octopusdemo-demolayer-codeContainer"
                }),
                resultC = o.dom.createDom("div", {
                    "class": "octopusdemo-demolayer-result"
                });
            contentContainer = o.dom.createDom("div", {
                "class": "octopusdemo-demolayer-content"
            });
            contextContainer = o.dom.createDom("div", {
                "class": "octopusdemo-demolayer-code"
            });
            textContainer = o.dom.createDom("div", {
                "class": "octopusdemo-demolayer-code"
            });
            demoContainer = o.dom.createDom("div", {
                "id": "octopusdemo_demolayer_result"
            });
            header.appendChild(btn);
            header.appendChild(nextbtn);
            header.appendChild(prebtn);
            code.appendChild(o.dom.createDom("div", {innerText: "简介："}));
            code.appendChild(textContainer);
            code.appendChild(o.dom.createDom("div", {innerText: "配置说明："}));
            code.appendChild(contextContainer);
            resultC.appendChild(o.dom.createDom("div", {innerText: "RESULT"}));
            resultC.appendChild(demoContainer);
            contentContainer.appendChild(code);
            contentContainer.appendChild(resultC);
            dom.appendChild(header);
            dom.appendChild(contentContainer);
            o.event.on(prebtn, "click", selectPre, false);
            o.event.on(nextbtn, "click", selectNext, false);
            o.event.on(btn, "click", demoLayerSlideOut, false);
            return dom;
        }

        function selectPre() {
            if(locked)  return;
            var _id = Number(currentDemo) - 1;
            locked = true;
            o.animation.fade(contentContainer, {}, function() {
                _id == 0 ? setCurrentDemo(demoLength - 1) : setCurrentDemo(_id);
                o.animation.fade(contentContainer, {
                    out: false
                }, function() {
                    locked = false;
                })
            });
        }

        function selectNext() {
            if(locked)  return;
            var _id = Number(currentDemo) + 1;
            locked = true;
            o.animation.fade(contentContainer, {}, function() {
                _id == demoLength ? setCurrentDemo(1) : setCurrentDemo(_id);
                o.animation.fade(contentContainer, {
                    out: false
                }, function() {
                    locked = false;
                })
            })
        }

        function setCurrentDemo(id) {
            var data = getDataById(id),
                inner = o.util.format(innerText, data.innerHTML);
            demoContainer.innerHTML = inner;
            textContainer.innerHTML = o.util.encodeHtml(data.innerHTML.info);
            contextContainer.innerHTML = data.innerHTML.content;
            currentDemo = id;
            try {
                CodePenEmbed.init();
            } catch(e) {
                var s = o.dom.createDom("script", {
                    async: true,
                    type: "text/javascript",
                    src: "http://codepen.io/assets/embed/ei.js"
                });
                document.body.appendChild(s);
            }
        }

        function getDataById(id) {
            var len = demoData.length,
                i = len;
            for(; i--; ) {
                if(demoData[i].id == id) {
                    return demoData[i];
                }
            }
            return null;
        }

        function demoLayerSlideIn() {
            o.animation.slide(demoLayer, {
                direction: "down",
                out: false
            });
        }

        function demoLayerSlideOut() {
            o.animation.slide(demoLayer, {
                direction: "up"
            })
        }

        function onLayerAdd(data) {
            var _layer = data.layer;
            if(_layer.CLASS_NAME == "octopus.Layer.DemoSelectedLayer") {
                layer = _layer;
                layer.initSelf();
            }
        }

        return {
            initialize: initialize
        }


    });

})(octopus);
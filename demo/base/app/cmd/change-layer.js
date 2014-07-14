(function(o, undefined) {

    "use strict";

    o.Cmd.ChangeLayerCmd = o.define(o.Cmd, {

        currentType: null,

        layerList: null,

        loaded: false,

        progress: null,

        domReady: false,

        initData: null,

        initialize: function() {
            o.Cmd.prototype.initialize.apply(this, arguments);
            this.layerList = {};
        },

        setApp: function() {
            o.Cmd.prototype.setApp.apply(this, arguments);
            var that = this;
            this.app.on("Global-OctopusApp-BeforeAppCompleted", function() {
                that.domReady = true;
                console.log("initData", that.initData);
                if(that.initData) {
                    that.createLayer(that.initData);
                }
            });
        },

        execute: function() {
            o.Cmd.prototype.execute.apply(this, arguments);
            if(!arguments[0] || this.currentType == arguments[0]) {
                console.warn("The Layer didn't change cause it hasn't changed!");
                return;
            }

            this.currentType = arguments[0];
            var layerobj = this.layerList[this.currentType],
                _layer = this.app.currentLayer;
            if(_layer) {
                _layer.deactivate();
            }
            if(layerobj) {
                if(layerobj.layer) {
                    this.setLayer(layerobj.layer);
                } else if(layerobj.data) {
                    this.onDataCompleted(layerobj.data);
                }
            } else {
                this.getDataByType(this.currentType);
            }
        },

        getDataByType: function(type) {
            this.app.executeCmd("octopus.Cmd.GetDataCmd", {
                url: "http://192.168.1.34:8000/getLayerData",
                //url: "http://127.0.0.1:8000/getLayerData",
                data: {
                    type: type
                },
                type: "ajaxJSONP",
                error: o.util.bind(this.onDataCompleted, this),
                complete: o.util.bind(this.onDataCompleted, this)
            });
        },

        onDataError: function() {
        },

        onDataCompleted: function(data) {
            var _data = data;
            /* Debug Start */
            //data = octopus.Cmd.ChangeLayerCmd.DEBUG_DATA[this.currentType];
            /* Debug End */
            console.log(_data);
            this.app.notify("octopus-ChangeLayer-DataCompleted", {
                type: this.currentType,
                data: _data
            })
            _data = o.util.clone(_data.content);
            if(!this.loaded) {
                this.loaded = true;
                this.checkFirstData();
            }
            if(this.domReady) {
                this.createLayer(_data);
            }
            if(!this.initData) {
                this.initData = _data;
            }
        },

        createLayer: function(data) {
            var initEvent = this.app.currentLayer ? true : false,
                layer = new o.Layer[octopus.Cmd.ChangeLayerCmd.Layer[this.currentType]]({
                data: data,
                initEvent: initEvent
            });
            this.layerList[this.currentType] = {
                layer: layer,
                data: data
            };
            this.app.addLayer(layer);
            this.setLayer(layer);
        },

        checkFirstData: function() {
            this.app.notify("octopus-App-BeforeRender");
        },

        setLayer: function(layer) {
            setTimeout(function() {
                console.log(layer.el);
                layer.activate();
            }, 1000);
            this.app.setCurrentLayer(layer);
        },

        CLASS_NAME: "octopus.Cmd.ChangeLayerCmd"
    });

    octopus.Cmd.ChangeLayerCmd.Layer = {
        "0": "DemoSelectedLayer",
        "21": "BlogLayer",
        "22": "BlogLayer",
        "4": "ContactLayer"
    }

    octopus.Cmd.ChangeLayerCmd.DEBUG_DATA = {
        "-1": {
            content: [

            ]
        },
        "0": {
            id: "1",
            mid: "browser_fe_1",
            content: [
                {
                    id: "01",
                    title:"模版化的轮播图",
                    src:"resources/img/test/1.jpg",
                    innerHTML: {
                        height: "400",
                        url: "BrzGs",
                        title: "octopus.Widget.Slider DEMO",
                        info: "模版模式下的轮播图是采用html配置的方法，自动生成的轮播图组件",
                        content: "octopusui-slider-loop为true时，轮播图为首尾相接类型<br>" +
                                "octopusui-slider-nobutton为true时，轮播图没有上一张、下一张按钮<br>" +
                                "octopusui-slider-nogizmos为true时，轮播图没有右下角的四个点<br>" +
                                "octopusui-slider-disable为true时，轮播图不再具有一切默认的点击事件的响应，此时点击事件触发为widget事件<br>" +
                                "octopusui-slider-notauto为true时，轮播图不再自动轮播<br>" +
                                "octopusui-slider-adaptive为true时，轮播图的大小自适应图片大小<br>" +
                                "octopusui-slider-notitle为true时，轮播图不再显示下方title栏<br>" +
                                "octopusui-slider-disscroll为true时，在轮播图上不再响应浏览器默认的scroll事件"
                    }
                },
                {id: "02",title:"demo", src:"resources/img/test/2.jpg"},
                {id: "03",title:"demo", src:"resources/img/test/3.jpg"},
                {id: "04",title:"demo", src:"resources/img/test/4.jpg"},
                {id: "05",title:"demo", src:"resources/img/test/5.jpg"},
                {id: "06",title:"demo", src:"resources/img/test/6.jpg"},
                {id: "07",title:"demo", src:"resources/img/test/7.jpg"},
                {id: "08",title:"demo", src:"resources/img/test/8.jpg"},
                {id: "09",title:"demo", src:"resources/img/test/9.jpg"},
                {id: "010",title:"demo", src:"resources/img/test/10.jpg"},
                {id: "011",title:"demo", src:"resources/img/test/11.jpg"},
                {id: "012",title:"demo", src:"resources/img/test/12.jpg"},
                {id: "013",title:"demo", src:"resources/img/test/13.jpg"}
            ]
        },
        "21": {
            id: "21",
            title: "Article",
            content: [
                {
                    index: "1",
                    id: "1",
                    title: "今天小黄鱼逆天了！",
                    imgURL: "resources/img/page/1.jpg",
                    summary: "这一天小黄鱼逆天了！",
                    content: "小黄鱼，脊椎动物，鱼纲，石首鱼科，又名：小鲜、大眼、花色、小黄瓜、古鱼、黄鳞鱼、小春色、金龙、厚鳞仔，也叫“黄花鱼”、“小黄花”。体形似大黄鱼，但头较长，眼较小，鳞片较大，尾柄短而宽，椎骨28～30块。耳石较大。体长约20余厘米。体背灰褐色，腹部金黄色。为近海底层结群性洄游鱼类，栖息于泥质或泥沙底质的海区。产卵场在沿岸海区水深10～25米，越冬场一般为40～80米，鱼群有明显的垂直移动现象，黄昏时上升，黎明下降，白昼栖息于底层或近底层。"
                }
                ,
                {
                    index: "2",
                    id: "2",
                    title: "今天小黄鱼碉堡了！",
                    imgURL: "resources/img/page/2.jpg",
                    summary: "这一天小黄鱼碉堡了！",
                    content: ""
                }
                ,
                {
                    index: "3",
                    id: "3",
                    title: "今天小黄鱼病倒了！",
                    imgURL: "resources/img/page/3.jpg",
                    summary: "这一天小黄鱼病倒了！",
                    content: ""
                }
                ,
                {
                    index: "4",
                    id: "4",
                    title: "今天小黄鱼挂了！",
                    imgURL: "",
                    summary: "这一天小黄鱼挂了！",
                    content: "七年前劫杀小黄鱼女司机 前天他在法庭上嚎哭"
                }
                ,
                {
                    index: "5",
                    id: "5",
                    title: "今天小黄鱼复活了！",
                    imgURL: "",
                    summary: "这一天小黄鱼复活了！",
                    content: ""
                }
            ]
        },
        "22": {
            id: "22",
            title: "Blog",
            content: [
                {
                    index: "1",
                    id: "1",
                    title: "为什么小黄鱼逆天了！",
                    imgURL: "",
                    summary: "为什么这一天小黄鱼逆天了！",
                    content: ""
                }
                ,
                {
                    index: "2",
                    id: "2",
                    title: "为什么小黄鱼碉堡了！",
                    imgURL: "",
                    summary: "为什么这一天小黄鱼碉堡了！",
                    content: ""
                }
                ,
                {
                    index: "3",
                    id: "3",
                    title: "为什么小黄鱼病倒了！",
                    imgURL: "",
                    summary: "为什么这一天小黄鱼病倒了！",
                    content: ""
                }
                ,
                {
                    index: "4",
                    id: "4",
                    title: "为什么小黄鱼挂了！",
                    imgURL: "",
                    summary: "为什么这一天小黄鱼挂了！",
                    content: ""
                }
                ,
                {
                    index: "5",
                    id: "5",
                    title: "为什么小黄鱼复活了！",
                    imgURL: "",
                    summary: "为什么这一天小黄鱼复活了！",
                    content: ""
                }
            ]
        }
    };

})(octopus);
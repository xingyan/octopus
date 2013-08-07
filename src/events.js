/**
 * @file
 * webapp通用组件基础库文件
 * 事件部分 －   event
 * @require lib/class.js
 * @require lib/util.js
 * @author oupeng-fe
 * @version 0.1
 */
;(function(o, undefined) {

    "use strict";

    /**
     * 定义库内事件支撑
     * @namespace octopus.event
     * @type {object}
     */
    o.event = {

        /**
         * @property observers
         * @desc 一个缓存事件监听的hash表
         * @type {object}
         */
        observers: null,

        /**
         * @method octopus.event.element
         * @desc 返回事件的节点
         * @param event {window.event}
         * @return 触发事件的节点 {DOMElement}
         */
        element: function(event) {
            return event.target || event.srcElement;
        },

        /**
         * @method octopus.event.isSingleTouch
         * @desc 判断是否单点
         * @param event {window.event}
         * @return {Boolean}
         */
        isSingleTouch: function(event) {
            return event.touches && event.touches.length == 1;
        },

        /**
         * @method octopus.event.isMultiTouch
         * @desc 判断是否多点
         * @param event {window.event}
         * @return {Boolean}
         */
        isMultiTouch: function(event) {
            return event.touches && event.touches.length > 1;
        },

        /**
         * @method octopus.event.isLeftClick
         * @desc 判断是否是左键点击
         * @param event {window.event}
         * @return {Boolean}
         */
        isLeftClick: function(event) {
            return (((event.which) && (event.which == 1)) ||
                ((event.button) && (event.button == 1)));
        },

        /**
         * @method octopus.event.isRightClick
         * @desc 判断是否右键点击
         * @param event {window.event}
         * @return {Boolean}
         */
        isRightClick: function(event) {
            return (((event.which) && (event.which == 3)) ||
                ((event.button) && (event.button == 2)));
        },

        /**
         * @method octopus.event.stop
         * @desc 把事件停了
         * @param event {window.event}
         * @param allowDefault {Boolean} -   是否把默认响应停了
         */
        stop: function(event, allowDefault) {
            if (!allowDefault) {
                if (event.preventDefault) {
                    event.preventDefault();
                } else {
                    event.returnValue = false;
                }
            }

            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
        },

        /**
         * @method octopus.event.findElement
         * @desc 找到触发事件的节点
         * @param event {window.event}
         * @return {DOMElement}
         */
        findElement: function(event) {
            var element = o.event.element(event);
            while (element.parentNode && (!element.tagName ||
                (element.tagName.toUpperCase() != tagName.toUpperCase()))){
                element = element.parentNode;
            }
            return element;
        },

        /**
         * @method octopus.event.on
         * @desc 监听事件
         * @param dom {String | DOMElement}
         * @param name {String}
         * @param fn {Function}
         * @param useCapture {Boolean}
         */
        on: function(dom, name, fn, useCapture) {
            var element = o.g(dom);
            useCapture = useCapture || false;

            if(name == "ortchange") {
                name = "orientationchange" in window ? "orientationchange" : "resize";
            }

            if(name == "ready") {
                name = "DOMContentLoaded";
            }

            if(!this.observers) {
                this.observers = {};
            }
            if(!element._eventCacheID) {
                var idPrefix = "eventCacheID_";
                if (element.id) {
                    idPrefix = element.id + "_" + idPrefix;
                }
                element._eventCacheID = o.util.createUniqueID(idPrefix);
            }
            var cacheID = element._eventCacheID;
            if(!this.observers[cacheID]) {
                this.observers[cacheID] = [];
            }
            this.observers[cacheID].push({
                'element': element,
                'name': name,
                'observer': fn,
                'useCapture': useCapture
            });
            if(element.addEventListener) {
                element.addEventListener(name, fn, useCapture);
            } else if (element.attachEvent) {
                element.attachEvent('on' + name, fn);
            }
            return element;
        },

        /**
         * @method octopus.event.stopObservingElement
         * @desc 把指定节点的所有事件监听停掉
         * @param dom {DOMElement}
         */
        stopObservingElement: function(dom) {
            var element = o.g(dom);
            var cacheID = element._eventCacheID;
            this._removeElementObservers(o.event.observers[cacheID]);
        },

        /**
         * @method octopus.event.stopEventObserver
         * @param dom {DOMElement}
         * @param event {String} 指定停掉的事件类型
         * @desc 此方法会将指定节点上的指定方法的所有事件监听停掉 慎用
         */
        stopEventObserver: function(dom, event) {
            var cacheID = o.g(dom)._eventCacheID,
                elementObservers = o.event.observers[cacheID];
            if (elementObservers) {
                var i = elementObservers.length;
                for(; i--; ) {
                    var entry = elementObservers[i];
                    if(event == entry.name) {
                        var args = new Array(entry.element,
                            entry.name,
                            entry.observer,
                            entry.useCapture);
                        o.event.un.apply(this, args);
                    }
                }
            }
        },

        /**
         * @private
         * @method _removeElementObservers
         * @desc具体做事情的方法
         * @param elementObservers {Array} 一堆事件缓存对象
         */
        _removeElementObservers: function(elementObservers) {
            if (elementObservers) {
                var i =  elementObservers.length;
                for( ; i--; ) {
                    var entry = elementObservers[i];
                    var args = new Array(entry.element,
                        entry.name,
                        entry.observer,
                        entry.useCapture);
                    o.event.un.apply(this, args);
                }
            }
        },

        /**
         * @method octopus.event.un
         * @desc 单删一个指定事件监听
         * @param dom {String | DOMElement}
         * @param name {String}
         * @param fn {Function}
         * @param useCapture {Boolean}
         * @return: 返回解除监听是否成功 {Boolean}
         */
        un: function(dom, name, fn, useCapture) {
            var element = o.g(dom);
            var cacheID = element._eventCacheID;
            useCapture = useCapture || false;
            if (name == 'keypress') {
                if ( navigator.appVersion.match(/Konqueror|Safari|KHTML/) ||
                    element.detachEvent) {
                    name = 'keydown';
                }
            }
            var foundEntry = false;
            var elementObservers = o.event.observers[cacheID];
            if (elementObservers) {
                var i=0;
                while(!foundEntry && i < elementObservers.length) {
                    var cacheEntry = elementObservers[i];
                    if ((cacheEntry.name == name) &&
                        (cacheEntry.observer == fn) &&
                        (cacheEntry.useCapture == useCapture)) {
                        elementObservers.splice(i, 1);
                        if (elementObservers.length == 0) {
                            o.event.observers[cacheID] = null;
                        }
                        foundEntry = true;
                        break;
                    }
                    i++;
                }
            }
            if (foundEntry) {
                if (element.removeEventListener) {
                    element.removeEventListener(name, fn, useCapture);
                } else if (element && element.detachEvent) {
                    element.detachEvent('on' + name, fn);
                }
            }
            return foundEntry;
        },

        /**
         * @property unloadCache
         * @desc 页面销毁的时候希望可以释放掉所有监听
         */
        unloadCache: function() {
            if (o.event && o.event.observers) {
                for (var cacheID in o.event.observers) {
                    var elementObservers = o.event.observers[cacheID];
                    o.event._removeElementObservers.apply(this,
                        [elementObservers]);
                }
                o.event.observers = false;
            }
        }
    };

    o.event.on(window, "unload", o.event.unloadCache, false);

    /**
     * @class octopus.Events
     * @desc 自定义事件类
     * @param object {Object} 观察订阅事件的对象 必需
     * @param element {DOMElement} 一个响应浏览器事件的dom 非必需 如果指定了此值 则表示要对该节点进行一次惨绝人寰的封装
     * @param fallThrough {Boolean}
     * @param options {Object}
     */
    o.Events = o.define({

        /**
         * @private
         * @constant octopus.Events.BROWSER_EVENTS
         * @desc 常规的浏览器事件
         */
        BROWSER_EVENTS: [
            "mouseover", "mouseout", "mousedown", "mouseup", "mousemove",
            "click", "dblclick", "rightclick", "dblrightclick",
            "resize",
            "focus", "blur",
            "touchstart", "touchmove", "touchend",
            "keydown"
        ],

        /**
         * @private
         * @property listeners
         * @type {object}
         * @desc 事件监听的hash表
         */
        listeners: null,

        /**
         * @private
         * @property object
         * @type {object}
         * @desc 事件对象所属的主体
         */
        object: null,

        /**
         * @private
         * @property element
         * @type {DOMELement}
         * @desc 事件绑定的节点
         */
        element: null,

        /**
         * @private
         * @property eventHandler
         * @desc 绑定在节点上的触发函数
         * @type {Function}
         */
        eventHandler: null,

        /**
         * @private
         * @property fallThrough
         * @desc 事件是否允许传播
         * @type {Boolean}
         */
        fallThrough: false,

        /**
         * @private
         * @property extensions
         * @type {Object}
         * @desc 所有被注册的新的自定义事件需要这个实例
         * 自定义事件是指以Oupeng.Events.*开头的自定义事件
         * key为自定义事件名如tap value为自定义事件如Oupeng.Events.Tap 只是举个例子不用太认真
         */
        extensions: null,

        /**
         * @private
         * @property extensionCount
         * @type {Object}
         * @desc key是自定义事件的key value是handler的个数
         */
        extensionCount: null,

        /**
         * @private
         * @constructos: octopus.Events.initialize
         * @param object {Object} 观察订阅事件的对象 必需
         * @param element {DOMElement} 一个响应浏览器事件的dom 非必需 如果指定了此值 则表示要对该节点进行一次惨绝人寰的封装
         * @param fallThrough {Boolean}
         * @param options {Object}
         */
        initialize: function(object, element, fallThrough, options) {
            o.extend(this, options);
            this.object = object;
            this.fallThrough = fallThrough;
            this.listeners = {};
            this.extensions = {};
            this.extensionCount = {};
            if (element != null) {
                this.attachToElement(element);
            }
        },

        /**
         * @method octopus.Events.destroy
         * @public
         * @desc 创建的事件对象自我解脱
         */
        destroy: function () {
            for (var e in this.extensions) {
                if (typeof this.extensions[e] !== "boolean") {
                    this.extensions[e].destroy();
                }
            }
            this.extensions = null;
            if (this.element) {
                o.event.stopObservingElement(this.element);
            }
            this.element = null;
            this.listeners = null;
            this.object = null;
            this.fallThrough = null;
            this.eventHandler = null;
        },

        /**
         * @private
         * @method attachToElement
         * @param element {DOMElement}
         */
        attachToElement: function(element) {
            if (this.element) {
                o.event.stopObservingElement(this.element);
            } else {
                this.eventHandler = o.util.bindAsEventListener(
                    this.handleBrowserEvent, this
                );
            }
            this.element = element;
            var i = 0,
                len = this.BROWSER_EVENTS.length;
            for (; i < len; i++) {
                o.event.on(element, this.BROWSER_EVENTS[i], this.eventHandler);
            }
            // 不去掉ie下会2掉
            o.event.on(element, "dragstart", o.event.stop);
        },

        /**
         * @private
         * @method handleBrowserEvent
         * @desc 在指定dom节点的情况下 封装该dom触发的event属性
         */
        handleBrowserEvent: function(evt) {
            var type = evt.type,
                listeners = this.listeners[type];
            if(!listeners || listeners.length == 0) return;
            var touches = evt.touches;
            if (touches && touches[0]) {
                var x = 0,
                    y = 0,
                    num = touches.length,
                    touch,
                    i = 0;
                for (; i < num; ++i) {
                    touch = touches[i];
                    x += touch.clientX;
                    y += touch.clientY;
                }
                evt.clientX = x / num;
                evt.clientY = y / num;
            }
            this.triggerEvent(type, evt);
        },

        /**
         * @method octopus.Events.on
         * @public
         * @desc 添加自定义事件监听
         * @param type {String} 事件类型
         * @param func {Function} 回调
         * @param obj {Object} 事件绑定的对象 默认为this.object
         * @param priority {Boolean | Object} 为true时 将增加的回调扔在触发回调队列的队头 可以理解为伪同步
         */
        on: function(type, func, obj, priority) {
            if (type in o.Events && !this.extensions[type]) {
                this.extensions[type] = new o.Events[type](this);
            }
            if (func != null) {
                if (obj == null || obj == undefined)  {
                    obj = this.object;
                }
                var listeners = this.listeners[type];
                if (!listeners) {
                    listeners = [];
                    this.listeners[type] = listeners;
                    this.extensionCount[type] = 0;
                }
                var listener = {obj: obj, func: func};
                if (priority) {
                    listeners.splice(this.extensionCount[type], 0, listener);
                    if (typeof priority === "object" && priority.extension) {
                        this.extensionCount[type]++;
                    }
                } else {
                    listeners.push(listener);
                }
            }
        },

        /**
         * @method octopus.Events.un
         * @public
         * @desc 取消自定义事件的监听
         * @param type {String} 事件类型
         * @param func {Function} 触发回调
         * @param obj {Object} 默认自身
         */
        un: function(type, func, obj) {
            if (obj == null)  {
                obj = this.object;
            }
            var listeners = this.listeners[type];
            if (listeners != null) {
                for (var i=0, len=listeners.length; i<len; i++) {
                    if (listeners[i].obj == obj && listeners[i].func == func) {
                        listeners.splice(i, 1);
                        break;
                    }
                }
            }
        },

        /**
         * @method octopus.Events.triggerEvent
         * @desc 触发事件
         * @param type {String} 触发事件类型
         * @param evt {event}
         */
        triggerEvent: function(type, evt) {
            var listeners = this.listeners[type];
            if(!listeners || listeners.length == 0) return undefined;
            if (evt == null) {
                evt = {};
            }
            evt.object = this.object;
            evt.element = this.element;
            if(!evt.type) {
                evt.type = type;
            }
            //clone一份
            listeners = listeners.slice();
            var continueChain,
                i = 0,
                len = listeners.length;
            for (; i < len; i++) {
                var callback = listeners[i];
                // bind the context to callback.obj
                continueChain = callback.func.apply(callback.obj, [evt]);
                if (continueChain === false) {
                    // 如果返回值为false表示回调到此为止
                    break;
                }
            }
            if (!this.fallThrough) {
                o.event.stop(evt, true);
            }
            return continueChain;
        },

        /**
         * @method octopus.Events.remove
         * @public
         * @desc 直接把指定事件类型的监听回调置空
         * @param type {String}
         */
        remove: function(type) {
            if (this.listeners[type] != null) {
                this.listeners[type] = [];
            }
        },

        /**
         * @method octopus.Events.register
         * @desc 批量增加事件
         * @param object {Object}
         */
        register: function(object) {
            for(var type in object) {
                if(type != "scope" && object.hasOwnProperty(type)) {
                    this.on(type, object[type], object.scope, false);
                }
            }
        },

        /**
         * @method octopus.Events.unregister
         * @desc 批量去除事件
         * @param object {Object}
         */
        unregister: function(object) {
            for(var type in object) {
                if(type != "scope" && object.hasOwnProperty(type)) {
                    this.un(type, object[type], object.scope);
                }
            }
        },

        CLASS_NAME: "Octopus.Events"
    });
})(octopus);
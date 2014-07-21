/**
 * @file
 * webapp通用组件基础库文件
 * promise部分
 * @require lib/class.js
 * @author wencheng
 * @version 1.1
 */
;(function(o, undefined) {

    "use strict"

    if (typeof window.Promise === 'function' && typeof window.Promise.resolve === 'function') {
        return o.Promise = window.Promise;
    }

    var STATES = {
        PENDING: 0,
        RESOLVED: 1,
        REJECTED: 2
    }

    /**
     * @class octopus.Promise
     * @desc 跟es6的新Promise规范完全一致
     */
    var Promise = o.Promise = o.define({

        state: STATES.PENDING,
        resolves: null,
        rejects: null,
        data: null,
        reason: null,

        /**
         * @private
         * @constructor octopus.Promise
         * @param {Function} func - 初始化函数，有resolve, reject两个函数
         */
        initialize: function(func) {
            var promise = this;

            this.state = STATES.PENDING;
            var resolves = this.resolves = [];
            var rejects = this.rejects = [];

            // At first change promise state after resolve|reject
            this._done(function(data) {
                this.data = data;
                promise.state = STATES.RESOLVED;
            });
            this._fail(function(reason) {
                this.reason = reason;
                promise.state = STATES.REJECTED;
            });

            func.call(this, Promise.makeResolve(this), Promise.makeReject(this));
            return this;
        },

        /**
         * then 添加回调函数
         * @param  {Function} doneCallback - 成功回调函数
         * @param  {Function} failCallback - 失败回调函数
         * @return {Promise} 返回一个新的Promise实例
         */
        then: function(doneCallback, failCallback) {
            var promise = this;

            return new Promise(function(resolve, reject) {
                if (doneCallback != null) {
                    var modifiedDoneCallback = function(data) {
                    // 返回值null算不算
                    var returnVal = doneCallback.call(this, data);
                    if (Promise.isPromise(returnVal)) {
                        returnVal.then(resolve, reject);
                    } else {
                        resolve(returnVal);
                    }
                }
                promise._done(modifiedDoneCallback);
                } else {
                    promise._done(resolve);
                }
                promise._fail(failCallback == null ? reject : failCallback);
            });
        },
        /**
         * catch 捕捉错误，可以捕捉前面Promise队列未被捕捉的错误
         * @param  {Function} failCallback - 失败回调函数
         * @return {Promise} 新的Promise
         */
        catch: function(failCallback) {
            return this.then(null, failCallback);
        },

        /**
         * 内部添加成功回调，如果Promise已是成功状态，则直接执行成功回调
         * @private
         */
        _done: function(doneCallback) {
            if (this.state === STATES.RESOLVED) {
                return doneCallback.call(this, this.data);
            }
            this.resolves.push(doneCallback);
            return this;
        },

        /**
         * 内部添加失败回调，如果Promise已是失败状态，则直接执行失败回调
         * @private
         */
        _fail: function(failCallback) {
            if (this.state === STATES.REJECTED) {
                return failCallback.call(this, this.reason);
            }
            this.rejects.push(failCallback);
            return this;
        }
    });

    /**
     * Promise 可能的状态
     * @type {Object}
     */
    Promise.STATES = STATES;

    /**
     * 判断是否是类Promise对象
     * @param  {*}  obj
     * @return {Boolean}
     */
    Promise.isPromise = function(obj) {
        return obj != null && typeof obj['then'] === 'function';
    }

    /**
     * 生成Promise实例内的resolve方法
     * @param  {Promise} promise - Promise实例
     * @return {Function} resolve函数
     */
    Promise.makeResolve = function(promise) {
        return function(data) {
            if (promise.state > STATES.PENDING) return;

            var resolves = promise.resolves,
                doneCallback;

            while (doneCallback = resolves.shift()) {
                doneCallback.call(promise, data);
            }
        }
    }

    /**
     * 生成Promise实例内的reject方法
     * @param  {Promise} promise - Promise实例
     * @return {Function} reject函数
     */
    Promise.makeReject = function(promise) {
        return function(reason) {
            if (promise.state > STATES.PENDING) return;

            var rejects = promise.rejects,
                failCallback;

            while (failCallback = rejects.shift()) {
                failCallback.call(promise, reason);
            }
        }
    }

    /**
     * 返回Promise对象，以value值解决。如果传入的value是类Promise的对象，则已value这个Promise
     * 的结果作为Promise的决定值
     *
     * @param  {*} value
     * @return {Promise} 新的Promise对象
     */
    Promise.resolve = function(value) {
        return new Promise(function(resolve, reject) {
            if (Promise.isPromise(value)) {
                value.then(resolve, reject);
            } else {
                resolve(value);
            }
        })
    }

    /**
     * 返回一个失败原因reason的失败Promise
     * @param  {String} reason - 失败原因
     * @return {Promise}
     */
    Promise.reject = function(reason) {
        return new Promise(function(resolve, reject) {
            reject(reason);
        });
    }

    /**
     * 生成新Promise, 所有promises成功才成功，只要有一个promises失败就失败
     * @param  {Array} promises
     * @return {Promise} 新的Promise
     */
    Promise.all = function(promises) {
        return new Promise(function(resolve, reject) {
            function pending(callback) {
                var counter = 0,
                    values = [];

                return function() {
                    var curIndex = counter;
                    counter++;

                    return function(data) {
                        values[curIndex] = data;

                        if (--counter == 0) {
                            callback.call(window, values);
                        }
                    }

                }
            }
            var done = pending(function(values) {
                resolve(values)
            })
            for (var i = 0; i < promises.length; i++) {
                var promise = promises[i];
                promise.then(done(), reject);
            }
        });
    }

    /**
     * 返回一个新Promise, 如果有一个promise最先完成，则新Promise用最先完成的数据完成，如果
     * 有一个promise最新失败，则已最先失败的promise的原因失败
     * @param  {Array} promises
     * @return {Promise} 新Promise
     */
    Promise.race = function(promises) {
        return new Promise(function(resolve, reject) {
            for (var i = 0; i < promises.length; i++) {
                promises[i].then(resolve, reject);
            }
        });
    }

})(octopus);
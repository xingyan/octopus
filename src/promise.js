;(function(o, undefined) {

    "use strict";

    o.PromiseMannager = o.define({

        promise: null,

        initialize: function(promise) {
            this.promise = promise;
        },

        _resolvePromise: function(value) {
            this.resolve(this.promise, value);
        },

        _rejectPromise: function(value) {
            this.reject(this.promise, value);
        },

        handleThenable: function(promise, ghost) {
            var then = null,
                that = this,
                resolved;
            try{
                if(promise === ghost) {
                    throw new Error();
                }
                then = ghost.then;
                if(typeof then === "function") {
                    then.call(ghost, function(val) {
                        if(resolved)    return true;
                        resolved = true;
                        if(ghost !== val) {
                            that.resolve(promise, val);
                        } else {
                            that.fulfill(promise, val);
                        }
                    }, function(val) {
                        if(resolved)    return true;
                        resolved = true;
                        that.reject(promise, val);
                    });
                    return true;
                }
            } catch(e) {
                if(resolved)    return true;
                that.reject(promise, e);
                return true;
            }
            return false;
        },

        resolve: function(promise, ghost) {
            if(promise === ghost || !this.handleThenable(promise, ghost)) {
                this.fulfill(promise, ghost)
            }
        },

        initPromise: function(func) {
            var that = this;
            try {
                func(that._resolvePromise, that._rejectPromise);
            } catch(e) {
                that._rejectPromise(e);
            }
        },

        CLASS_NAME: "octopus.PromiseManager"
    });

    o.Promise = o.define({

        promiseManager: null,

        state: "free",

        handlerStacks: null,

        initialize: function(resolve) {
            this.promiseManager = new o.PromiseMannager(this);
            this.handlerStacks = [];
            this.promiseManager.initPromise(resolve);
        },

        initResolve: function() {

        },

        then: function(onResolved, onRejected) {
            if(this.state == "free") {
                try {
                    onResolved()
                } catch {
                    this.
                }
            }
        },

        resolve: function() {
            this.state = "resolve";
        },



        "CLASS_NAME": "octopus.Promise"
    });

})(octopus);
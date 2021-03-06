!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.ContainerModule=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
module.exports = _dereq_('./lib/ioc');

},{"./lib/ioc":2}],2:[function(_dereq_,module,exports){
var Module = _dereq_('./module');
var utils = _dereq_('./utils');
var strings = _dereq_('./strings');

function ContainerModule() {
    this._modules = {};
}

ContainerModule.prototype.register = function (name, deps, ctor) {
    if (!utils.isString(name)) {
        throw new Error(strings.ERROR_MODULE_NAME_INCORRECT);
    }

    if (utils.isDefined(this._modules[name])) {
        throw new Error(utils.format(strings.ERROR_MODULE_ALREADY_DEFINED, [name]));
    }

    if (utils.isFunction(deps)) {
        ctor = deps;
        deps = [];
    }

    if (!utils.isArray(deps) || !utils.isFunction(ctor)) {
        throw new Error(strings.ERROR_PARAMETERS_INCORRECT);
    }

    if (utils.isArray(ctor.dependencies)) {
        deps = utils.union(deps, ctor.dependencies);
    }

    this._modules[name] = new Module(name, deps, ctor);

    return this;
};

ContainerModule.prototype.resolve = function (name) {
    if (!utils.isDefined(this._modules[name])) {
        throw new Error(utils.format(strings.ERROR_MODULE_NOT_FOUND, [name]));
    }

    return this._modules[name].getInstance();
};

ContainerModule.prototype.init = function () {
    for (var key in this._modules) {
        if (this._modules.hasOwnProperty(key)) {
            buildModule(this._modules[key], [], this._modules);
        }
    }

    return this;
};

function buildModule(module, stack, modules) {
    if (module.isReady()) {
        return;
    }

    if (stack.indexOf(module._name) !== -1) {
        throw new Error(utils.format(strings.ERROR_CIRCULAR_DEPENDENCY, [module._name]));
    }

    var deps = [];

    module._deps.forEach(function (dependencyName) {
        var dependency = modules[dependencyName];

        if (!utils.isDefined(dependency)) {
            throw new Error(utils.format(strings.ERROR_MODULE_NOT_FOUND, [dependencyName]));
        }

        if (!dependency.isReady()) {
            stack.push(module._name);
            buildModule(dependency, stack, modules);
            stack.pop();
        }

        deps.push(dependency.getInstance());
    });

    module.build(deps);
}

module.exports = ContainerModule;

},{"./module":3,"./strings":4,"./utils":5}],3:[function(_dereq_,module,exports){
var utils = _dereq_('./utils');
var strings = _dereq_('./strings');

function Module(name, deps, ctor) {
    this._name = name;
    this._deps = deps;
    this._ctor = ctor;
}

Module.prototype.isReady = function () {
    return utils.isDefined(this._instance);
};

Module.prototype.build = function (deps) {
    if (this.isReady()) {
        throw new Error(utils.format(strings.ERROR_MODULE_ALREADY_INITIALIZED, [this._name]));
    }

    this._instance = this._ctor.apply(null, deps);

    if (!this.isReady()) {
        throw new Error(utils.format(strings.ERROR_MODULE_INITIALIZE, [this._name]));
    }
};

Module.prototype.getInstance = function () {
    if (!this.isReady()) {
        throw new Error(utils.format(strings.ERROR_MODULE_NOT_INITIALIZED, [this._name]));
    }

    return this._instance;
};

module.exports = Module;

},{"./strings":4,"./utils":5}],4:[function(_dereq_,module,exports){
module.exports = {
    ERROR_CIRCULAR_DEPENDENCY: '{0}: Circular dependency',
    ERROR_MODULE_ALREADY_DEFINED: '{0}: Module is already defined',
    ERROR_MODULE_ALREADY_INITIALIZED: '{0}: Module is already initialized',
    ERROR_MODULE_INITIALIZE: '{0}: Module return empty result',
    ERROR_MODULE_NAME_INCORRECT: 'Incorrect module name',
    ERROR_MODULE_NOT_INITIALIZED: '{0}: Module is not initialized',
    ERROR_MODULE_NOT_FOUND: '{0}: Module not found',
    ERROR_PARAMETERS_INCORRECT: 'Incorrect parameters'
};
},{}],5:[function(_dereq_,module,exports){
function isString(value) {
    return typeof value === 'string';
}

function isFunction(value) {
    return typeof value === 'function';
}

function isArray(value) {
    return Array.isArray(value);
}

function isDefined(value) {
    return typeof value !== 'undefined';
}

function format(str, params) {
    return str.replace(/\{(\d+)}/g, function (s, idx) {
        return params[parseInt(idx)];
    });
}

function extend() {
    var objects = Array.prototype.slice.call(arguments);
    var root = objects[0];

    for (var i = 1; i < objects.length; i++) {
        var sub = objects[i];

        for (var key in sub) {
            if (sub.hasOwnProperty(key) && isDefined(sub[key])) {
                root[key] = sub[key];
            }
        }
    }

    return root;
}

function union() {
    var arrays = Array.prototype.slice.call(arguments);
    var result = [];

    for (var i = 0; i < arrays.length; i++) {
        var array = arrays[i];

        if (!isArray(array)) {
            throw new Error(format('Argument {0} is not array', [(i + 1)]));
        }

        for (var j = 0; j < array.length; j++) {
            result.push(array[j]);
        }
    }

    return result;
}

exports.isString = isString;
exports.isFunction = isFunction;
exports.isArray = isArray;
exports.isDefined = isDefined;
exports.format = format;
exports.extend = extend;
exports.union = union;

},{}]},{},[1])
(1)
});
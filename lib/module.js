var utils = require('./utils');
var strings = require('./strings');

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
        throw new Error(strings.ERROR_MODULE_ALREADY_INITIALIZED);
    }

    this._instance = this._ctor.apply(null, deps);

    if (!this.isReady()) {
        throw new Error(strings.ERROR_MODULE_INITIALIZE);
    }
};

Module.prototype.getInstance = function () {
    if (!this.isReady()) {
        throw new Error(strings.ERROR_MODULE_NOT_INITIALIZED);
    }

    return this._instance;
};

module.exports = Module;

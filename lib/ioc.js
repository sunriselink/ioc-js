var Module = require('./module');
var utils = require('./utils');
var strings = require('./strings');

function ContainerModule() {
    this._modules = {};
}

ContainerModule.prototype.register = function (name, deps, ctor) {
    if (!utils.isString(name)) {
        throw new Error(strings.ERROR_MODULE_NAME_INCORRECT);
    }

    if (utils.isDefined(this._modules[name])) {
        throw new Error(strings.ERROR_MODULE_ALREADY_DEFINED);
    }

    if (utils.isFunction(deps)) {
        ctor = deps;
        deps = [];
    }

    if (!utils.isArray(deps) || !utils.isFunction(ctor)) {
        throw new Error(strings.ERROR_PARAMETERS_INCORRECT);
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

    module._deps.forEach(function (dependency) {
        if (!utils.isDefined(modules[dependency])) {
            throw new Error(utils.format(strings.ERROR_MODULE_NOT_FOUND, [dependency]));
        }

        if (!modules[dependency].isReady()) {
            stack.push(module._name);
            buildModule(modules[dependency], stack, modules);
            stack.pop();
        }

        deps.push(modules[dependency].getInstance());
    });

    module.build(deps);
}

module.exports = ContainerModule;

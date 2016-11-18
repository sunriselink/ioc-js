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

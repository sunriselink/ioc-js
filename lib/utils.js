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

    if (objects.length < 2) {
        return root;
    }

    for (var i = 1; i < objects.length; i++) {
        var sub = objects[i];
        
        for (var key in sub) {
            if (sub.hasOwnProperty(key) && !!sub[key]) {
                root[key] = sub[key];
            }
        }
    }

    return root;
}

exports.isString = isString;
exports.isFunction = isFunction;
exports.isArray = isArray;
exports.isDefined = isDefined;
exports.format = format;
exports.extend = extend;

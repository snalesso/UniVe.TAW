"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.nameOfFunction = function (fn) {
        var ret = fn.toString();
        ret = ret.substr('function '.length);
        ret = ret.substr(0, ret.indexOf('('));
        return ret;
    };
    Utils.prototype.getPropertyName = function (propertyFunction) {
        return /\.([^\.;]+);?\s*\}$/.exec(propertyFunction.toString())[1];
    };
    return Utils;
}());
exports.Utils = Utils;

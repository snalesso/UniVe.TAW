"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function NameOfFunction(fn) {
    var ret = fn.toString();
    ret = ret.substr('function '.length);
    ret = ret.substr(0, ret.indexOf('('));
    return ret;
}
exports.NameOfFunction = NameOfFunction;
function GetPropertyName(propertyFunction) {
    return /\.([^\.;]+);?\s*\}$/.exec(propertyFunction.toString())[1];
}
exports.GetPropertyName = GetPropertyName;
function GetAge(birthDate) {
    var today = new Date();
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
exports.GetAge = GetAge;
//# sourceMappingURL=utils.js.map
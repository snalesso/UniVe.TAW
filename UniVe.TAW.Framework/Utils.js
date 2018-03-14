var UniVe;
(function (UniVe) {
    var TAW;
    (function (TAW) {
        var Framework;
        (function (Framework) {
            var Utils = /** @class */ (function () {
                function Utils() {
                }
                Utils.NameOf_Function = function (fn) {
                    var ret = fn.toString();
                    ret = ret.substr('function '.length);
                    ret = ret.substr(0, ret.indexOf('('));
                    return ret;
                };
                return Utils;
            }());
            Framework.Utils = Utils;
        })(Framework = TAW.Framework || (TAW.Framework = {}));
    })(TAW = UniVe.TAW || (UniVe.TAW = {}));
})(UniVe || (UniVe = {}));
//# sourceMappingURL=Utils.js.map
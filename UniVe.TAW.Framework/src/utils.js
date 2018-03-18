var unive;
(function (unive) {
    var taw;
    (function (taw) {
        var framework;
        (function (framework) {
            var Utils = /** @class */ (function () {
                function Utils() {
                }
                Utils.nameOfFunction = function (fn) {
                    var ret = fn.toString();
                    ret = ret.substr('function '.length);
                    ret = ret.substr(0, ret.indexOf('('));
                    return ret;
                };
                return Utils;
            }());
            framework.Utils = Utils;
        })(framework = taw.framework || (taw.framework = {}));
    })(taw = unive.taw || (unive.taw = {}));
})(unive || (unive = {}));
//# sourceMappingURL=utils.js.map
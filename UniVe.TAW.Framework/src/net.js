var unive;
(function (unive) {
    var taw;
    (function (taw) {
        var framework;
        (function (framework) {
            var net;
            (function (net) {
                var HttpResponse = /** @class */ (function () {
                    function HttpResponse(content, error, errorMessage) {
                        this.content = content;
                        this.error = error;
                        this.errorMessage = errorMessage;
                    }
                    return HttpResponse;
                }());
                net.HttpResponse = HttpResponse;
            })(net = framework.net || (framework.net = {}));
        })(framework = taw.framework || (taw.framework = {}));
    })(taw = unive.taw || (unive.taw = {}));
})(unive || (unive = {}));
//# sourceMappingURL=net.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HttpMessage = /** @class */ (function () {
    function HttpMessage(Content, ErrorMessage) {
        this.Content = Content;
        this.ErrorMessage = ErrorMessage;
    }
    Object.defineProperty(HttpMessage.prototype, "HasError", {
        get: function () {
            return this.ErrorMessage != null;
        },
        enumerable: true,
        configurable: true
    });
    return HttpMessage;
}());
exports.HttpMessage = HttpMessage;
//# sourceMappingURL=net.js.map
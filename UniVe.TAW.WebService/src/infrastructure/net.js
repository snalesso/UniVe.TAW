"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HttpMessage = /** @class */ (function () {
    function HttpMessage(Content, ErrorMessage) {
        this.Content = Content;
        this.ErrorMessage = ErrorMessage;
    }
    Object.defineProperty(HttpMessage.prototype, "HasError", {
        // TODO: check if angular side can call .HasError()
        // TODO: should return true/false, sometimes returns undefined, check
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
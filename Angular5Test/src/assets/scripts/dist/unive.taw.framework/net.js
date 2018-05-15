"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var HttpResponse = /** @class */ (function () {
    function HttpResponse(content, error, errorMessage) {
        this.content = content;
        this.error = error;
        this.errorMessage = errorMessage;
    }
    return HttpResponse;
}());
exports.HttpResponse = HttpResponse;

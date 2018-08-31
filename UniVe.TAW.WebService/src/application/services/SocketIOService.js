"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SocketIOService = /** @class */ (function () {
    function SocketIOService(_server) {
        this._server = _server;
        this._connectedClients = [];
        if (this._server == null)
            throw new Error("_server cannot be null");
    }
    SocketIOService.prototype.send = function (userId, data) {
    };
    SocketIOService.prototype.broadcast = function (data) {
    };
    return SocketIOService;
}());
exports.default = SocketIOService;
//# sourceMappingURL=SocketIOService.js.map
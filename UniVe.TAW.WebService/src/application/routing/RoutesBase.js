"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var RoutesBase = /** @class */ (function () {
    function RoutesBase(socketIOServer) {
        this._router = express.Router();
        if (!socketIOServer)
            throw new Error("ArgumentNullException for socketIoServer");
        this._socketIOServer = socketIOServer;
    }
    Object.defineProperty(RoutesBase.prototype, "Router", {
        get: function () { return this._router; },
        enumerable: true,
        configurable: true
    });
    return RoutesBase;
}());
exports.default = RoutesBase;
//# sourceMappingURL=RoutesBase.js.map
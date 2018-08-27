"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var RoutesBase = /** @class */ (function () {
    function RoutesBase(socketIoServer) {
        this._router = express.Router();
        if (!socketIoServer)
            throw new Error("ArgumentNullException for socketIoServer");
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
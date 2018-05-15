"use strict";
//namespace unive.taw.framework.game {
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var game_1 = require("./game");
var Cacciatorpediniere = /** @class */ (function (_super) {
    __extends(Cacciatorpediniere, _super);
    function Cacciatorpediniere() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.size = 2;
        return _this;
    }
    return Cacciatorpediniere;
}(game_1.Ship));
exports.Cacciatorpediniere = Cacciatorpediniere;
var Sottomarino = /** @class */ (function (_super) {
    __extends(Sottomarino, _super);
    function Sottomarino() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.size = 3;
        return _this;
    }
    return Sottomarino;
}(game_1.Ship));
exports.Sottomarino = Sottomarino;
var Corazzata = /** @class */ (function (_super) {
    __extends(Corazzata, _super);
    function Corazzata() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.size = 4;
        return _this;
    }
    return Corazzata;
}(game_1.Ship));
exports.Corazzata = Corazzata;
var Portaerei = /** @class */ (function (_super) {
    __extends(Portaerei, _super);
    function Portaerei() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.size = 5;
        return _this;
    }
    return Portaerei;
}(game_1.Ship));
exports.Portaerei = Portaerei;
//# sourceMappingURL=game.ships.js.map
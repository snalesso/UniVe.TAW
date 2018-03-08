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
var Chat;
(function (Chat) {
    var MobileChatService = /** @class */ (function () {
        function MobileChatService() {
        }
        MobileChatService.prototype.SendMessage = function (content) {
            throw new Error("Method not implemented.");
        };
        MobileChatService.prototype.Subscribe = function (someId, callback) {
            throw new Error("Method not implemented.");
        };
        return MobileChatService;
    }());
    var Subscription = /** @class */ (function () {
        function Subscription() {
        }
        Subscription.prototype.Unsubscribe = function () { };
        return Subscription;
    }());
    var RawMessage = /** @class */ (function () {
        function RawMessage(content, senderId) {
            this.Content = content;
            this.SenderId = senderId;
        }
        return RawMessage;
    }());
    var StampedMessage = /** @class */ (function (_super) {
        __extends(StampedMessage, _super);
        function StampedMessage(rawMessage) {
            var _this = _super.call(this, rawMessage.Content, rawMessage.SenderId) || this;
            _this.Timestamp = new Date();
            return _this;
        }
        return StampedMessage;
    }(RawMessage));
})(Chat || (Chat = {}));
//# sourceMappingURL=Chat.js.map
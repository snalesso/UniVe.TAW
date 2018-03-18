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
var unive;
(function (unive) {
    var taw;
    (function (taw) {
        var framework;
        (function (framework) {
            var chat;
            (function (chat) {
                var MobileChatService = /** @class */ (function () {
                    function MobileChatService() {
                    }
                    MobileChatService.prototype.SendMessage = function (content) {
                        throw new Error("Method not implemented.");
                    };
                    MobileChatService.prototype.Subscribe = function (someId, callback) {
                        throw new Error("Method not implemented.");
                    };
                    MobileChatService.prototype.SubscribeNew = function (someId, callback) {
                        throw new Error("Method not implemented.");
                    };
                    return MobileChatService;
                }());
                chat.MobileChatService = MobileChatService;
                var Subscription = /** @class */ (function () {
                    function Subscription() {
                    }
                    Subscription.prototype.Unsubscribe = function () { };
                    return Subscription;
                }());
                chat.Subscription = Subscription;
                var RawMessage = /** @class */ (function () {
                    function RawMessage(content, senderId) {
                        this.Content = content;
                        this.SenderId = senderId;
                    }
                    return RawMessage;
                }());
                chat.RawMessage = RawMessage;
                var StampedMessage = /** @class */ (function (_super) {
                    __extends(StampedMessage, _super);
                    function StampedMessage(rawMessage) {
                        var _this = _super.call(this, rawMessage.Content, rawMessage.SenderId) || this;
                        _this.UnixTimestamp = Date.now();
                        return _this;
                    }
                    return StampedMessage;
                }(RawMessage));
                chat.StampedMessage = StampedMessage;
            })(chat = framework.chat || (framework.chat = {}));
        })(framework = taw.framework || (taw.framework = {}));
    })(taw = unive.taw || (unive.taw = {}));
})(unive || (unive = {}));
//# sourceMappingURL=chat.js.map
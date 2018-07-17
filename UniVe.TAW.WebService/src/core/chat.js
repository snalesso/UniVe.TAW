"use strict";
// export interface IChatService {
//     SendMessage(content: string): boolean;
//     Subscribe(someId: number, callback: (message: TimeStampedMessage) => void): Subscription;
// }
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
// // export class MobileChatService implements IChatService {
// //     SendMessage(content: string): boolean {
// //         throw new Error("Method not implemented.");
// //     }
// //     Subscribe(someId: number, callback: (message: StampedMessage) => void): Subscription {
// //         throw new Error("Method not implemented.");
// //     }
// //     SubscribeNew(someId: number, callback: () => void): Subscription {
// //         throw new Error("Method not implemented.");
// //     }
// // }
// export class Subscription {
//     public Unsubscribe(): void { }
// }
var RawMessage = /** @class */ (function () {
    function RawMessage(Text, SenderId) {
        this.Text = Text;
        this.SenderId = SenderId;
    }
    return RawMessage;
}());
exports.RawMessage = RawMessage;
var TimeStampedMessage = /** @class */ (function (_super) {
    __extends(TimeStampedMessage, _super);
    function TimeStampedMessage(rawMessage) {
        var _this = _super.call(this, rawMessage.Text, rawMessage.SenderId) || this;
        _this.DateTime = new Date();
        return _this;
    }
    return TimeStampedMessage;
}(RawMessage));
exports.TimeStampedMessage = TimeStampedMessage;
//# sourceMappingURL=chat.js.map
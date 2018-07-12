// export interface IChatService {
//     SendMessage(content: string): boolean;
//     Subscribe(someId: number, callback: (message: TimeStampedMessage) => void): Subscription;
// }

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

export class RawMessage {

    public constructor(text: string, senderId: number) {
        this.Text = text;
        this.SenderId = senderId;
    }

    public readonly Text: string;
    public readonly SenderId: number;
}

export class TimeStampedMessage extends RawMessage {

    public constructor(rawMessage: RawMessage) {
        super(rawMessage.Text, rawMessage.SenderId);
        this.DateTime = new Date();
    }

    public readonly DateTime: Date;
}

namespace UniVe.TAW.Framework.Chat {

    export interface IChatService {
        SendMessage(content: string): boolean;
        Subscribe(someId: number, callback: (message: StampedMessage) => void): Subscription;
    }

    export class MobileChatService implements IChatService {

        SendMessage(content: string): boolean {
            throw new Error("Method not implemented.");
        }

        Subscribe(someId: number, callback: (message: StampedMessage) => void): Subscription {
            throw new Error("Method not implemented.");
        }

        SubscribeNew(someId: number, callback: () => void): Subscription {
            throw new Error("Method not implemented.");
        }
    }

    export class Subscription {
        public Unsubscribe(): void { }
    }

    export class RawMessage {

        public constructor(content: string, senderId: number) {
            this.Content = content;
            this.SenderId = senderId;
        }

        public readonly Content: string;
        public readonly SenderId: number;
    }

    export class StampedMessage extends RawMessage {

        public constructor(rawMessage: RawMessage) {
            super(rawMessage.Content, rawMessage.SenderId);
            this.UnixTimestamp = Date.now();
        }

        public readonly UnixTimestamp: number;
    }

}
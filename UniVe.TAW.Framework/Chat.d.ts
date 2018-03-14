declare namespace UniVe.TAW.Framework.Chat {
    interface IChatService {
        SendMessage(content: string): boolean;
        Subscribe(someId: number, callback: (message: StampedMessage) => void): Subscription;
    }
    class MobileChatService implements IChatService {
        SendMessage(content: string): boolean;
        Subscribe(someId: number, callback: (message: StampedMessage) => void): Subscription;
        SubscribeNew(someId: number, callback: () => void): Subscription;
    }
    class Subscription {
        Unsubscribe(): void;
    }
    class RawMessage {
        constructor(content: string, senderId: number);
        readonly Content: string;
        readonly SenderId: number;
    }
    class StampedMessage extends RawMessage {
        constructor(rawMessage: RawMessage);
        readonly UnixTimestamp: number;
    }
}

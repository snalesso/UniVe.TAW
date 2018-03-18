interface IChatService {
    SendMessage(content: string): boolean;
    Subscribe(someId: number, callback: (message: StampedMessage) => void): Subscription;
}
declare class MobileChatService implements IChatService {
    SendMessage(content: string): boolean;
    Subscribe(someId: number, callback: (message: StampedMessage) => void): Subscription;
    SubscribeNew(someId: number, callback: () => void): Subscription;
}
declare class Subscription {
    Unsubscribe(): void;
}
declare class RawMessage {
    constructor(content: string, senderId: number);
    readonly Content: string;
    readonly SenderId: number;
}
declare class StampedMessage extends RawMessage {
    constructor(rawMessage: RawMessage);
    readonly UnixTimestamp: number;
}

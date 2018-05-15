export interface IChatService {
    SendMessage(content: string): boolean;
    Subscribe(someId: number, callback: (message: StampedMessage) => void): Subscription;
}
export declare class MobileChatService implements IChatService {
    SendMessage(content: string): boolean;
    Subscribe(someId: number, callback: (message: StampedMessage) => void): Subscription;
    SubscribeNew(someId: number, callback: () => void): Subscription;
}
export declare class Subscription {
    Unsubscribe(): void;
}
export declare class RawMessage {
    constructor(content: string, senderId: number);
    readonly Content: string;
    readonly SenderId: number;
}
export declare class StampedMessage extends RawMessage {
    constructor(rawMessage: RawMessage);
    readonly UnixTimestamp: number;
}

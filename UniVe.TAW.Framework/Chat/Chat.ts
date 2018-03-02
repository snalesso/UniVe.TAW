namespace Chat {

    interface IChatService {
        SendMessage(content: string): void;
        SubscribeToMessageArrivals(userId: number): Subscription;
    }

    class Subscription {
        public Unsubscribe(): void { }
    }

    class RawMessage {
        public Content: string;
        public SenderId: number;
    }

    class StampedMessage extends RawMessage {
        public Timestamp: Date;
    }
}
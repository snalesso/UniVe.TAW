//namespace unive.taw.common.net {

export class HttpMessage<T> {

    public constructor(
        public readonly content: T,
        //public readonly error?: Object,
        public readonly errorMessage?: string) {
    }
}
//}
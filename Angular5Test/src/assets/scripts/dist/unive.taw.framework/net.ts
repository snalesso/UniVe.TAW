export class HttpResponse<T> {

    public constructor(
        public readonly content: T,
        public readonly error?: Object,
        public readonly errorMessage?: string) {
    }
}
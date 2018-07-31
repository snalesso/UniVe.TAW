export class HttpMessage<T> {

    public constructor(
        public readonly Content: T,
        public readonly ErrorMessage?: string) {
    }

    public get HasError(): boolean {
        return this.ErrorMessage != null; // TODO: should return true/false, sometimes returns undefined, check
    }

}
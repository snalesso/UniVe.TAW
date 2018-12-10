export class HttpMessage<T> {

    public constructor(
        public readonly Content: T,
        public readonly ErrorMessage?: string) {
    }

    // TODO: check if angular side can call .HasError()
    // TODO: should return true/false, sometimes returns undefined, check
    public get HasError(): boolean {
        return this.ErrorMessage != null;
    }

}
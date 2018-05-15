export declare class HttpResponse<T> {
    readonly content: T;
    readonly error: Object;
    readonly errorMessage: string;
    constructor(content: T, error?: Object, errorMessage?: string);
}

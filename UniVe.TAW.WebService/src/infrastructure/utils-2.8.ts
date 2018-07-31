// this only works from 2.8 onwards
export type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};
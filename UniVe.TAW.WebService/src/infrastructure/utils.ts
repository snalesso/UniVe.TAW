// export type MutableHelper<T, TNames extends string> = { [P in TNames]: (T & { [name: string]: never })[P] };
// export type Mutable<T> = MutableHelper<T, Extract<keyof T, string>>;

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
export function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
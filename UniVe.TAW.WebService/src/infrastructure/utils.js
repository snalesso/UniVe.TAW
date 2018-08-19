"use strict";
// export type MutableHelper<T, TNames extends string> = { [P in TNames]: (T & { [name: string]: never })[P] };
// export type Mutable<T> = MutableHelper<T, Extract<keyof T, string>>;
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
exports.getRandomArbitrary = getRandomArbitrary;
/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.getRandomInt = getRandomInt;
function getRandomBoolean() {
    return Math.random() >= 0.5;
}
exports.getRandomBoolean = getRandomBoolean;
//# sourceMappingURL=utils.js.map
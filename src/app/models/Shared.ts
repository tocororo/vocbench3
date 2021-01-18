export class Pair<S,T> {
    first: S;
    second: T;
}

/**
 * Map which value is a list of given type T
 */
export interface Multimap<T> {
    [key:string]: T[]
}
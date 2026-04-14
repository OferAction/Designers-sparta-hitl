export type Common<T, U> = Pick<T, Extract<keyof T, keyof U>>;

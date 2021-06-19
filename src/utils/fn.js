export const identity = x => x;
export const compose2 = (f, g) => x => g(f(x));
export const compose = (...fns) => fns.flat().reduce(compose2, identity);

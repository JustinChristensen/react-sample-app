export const isFunction = o => typeof o === 'function';
export const isObject = o => String(o) === '[object Object]' && Object.getPrototypeOf(o) === null;
export const isArray = o => Array.isArray(o);
export const isUndefined = o => o === undefined;
export const refEq = (x, y) => x === y;

export const shallowEqual = (a, b) => {
    if (Object.is(a, b)) return true;

    if (a === null || b === null) return false;
    if (typeof a !== 'object' || typeof b !== 'object') return false;

    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) return false;

    return aKeys.every(aKey => Object.is(a[aKey], b[aKey]));
};

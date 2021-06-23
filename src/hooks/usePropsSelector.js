import { shallowEqual, isObject } from '../utils/eq.js';
import { useSelector } from './useSelector.js';

export const propsEqual = (nextProps, prevProps) => {
    if (Object.is(nextProps, prevProps)) return true;

    const nextKeys = Object.keys(nextProps),
        prevKeys = Object.keys(prevProps);

    if (nextKeys.length !== prevKeys.length) return false;

    return nextKeys.every(k => shallowEqual(nextProps[k], prevProps[k]));
};

export const usePropsSelector = (selector, userEqualFn = propsEqual, userProps) => {
    const doHook = props => Object.freeze({
        ...useSelector(selector, userEqualFn),
        ...props
    });

    // the user provided props, but overwrote the equality function in the process
    if (isObject(userEqualFn)) {
        userProps = userEqualFn;
        userEqualFn = propsEqual;
    }

    // curried to allow for composition
    return userProps ? doHook(userProps) : doHook;
};

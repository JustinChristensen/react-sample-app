import { shallowEqual, isFunction, isObject } from '../utils/eq.js';
import { useSelector, useStore } from '../utils/redux-context.jsx';

// the below uses useSelector from react-redux to do the heavy lifting, because I don't
// want to have to reimplement their subscription tree stuff from scratch just yet

// heuristic equality check, if the user needs a deep equality check they'll need to provide their own
export const propsEqual = (nextProps, prevProps) => {
    const nextKeys = Object.keys(nextProps),
        prevKeys = Object.keys(prevProps);

    if (nextKeys.length !== prevKeys.length) return false;

    return nextKeys.every(k => {
        const np = nextProps[k], pp = prevProps[k];

        if (isFunction(np) && isFunction(pp)) return true; // assume selected functions are equal
        else return shallowEqual(np, pp);
    });
};

const decorateEventHandlers = (store, props) =>
    Object.keys(props).forEach(key => {
        let fn;
        if (isFunction(fn = props[key])) {
            // pin dispatch and the state getter
            // to the first parameter, which will more often than not be an event
            const usePropsOrStateWrapper = (maybeE, ...rest) => {
                if (maybeE?.nativeEvent) {
                    maybeE.$dispatch = store.dispatch;
                    maybeE.$getState = store.getState;
                }

                return fn(maybeE, ...rest);
            };

            props[key] = usePropsOrStateWrapper;
        }
    });

export const usePropsOrState = (selector = () => undefined, userEqualFn = propsEqual, userProps) => {
    const doHook = props => {
        const store = useStore();
        const stateProps = useSelector(selector, userEqualFn);

        const nextProps = {
            ...stateProps,
            ...props
        };

        if (store) decorateEventHandlers(store, nextProps);

        return Object.freeze(nextProps);
    };

    // the user provided props, but overwrote the equality function in the process
    if (isObject(userEqualFn)) {
        userProps = userEqualFn;
        userEqualFn = () => true;
    }

    // curried to allow for composition
    return userProps ? doHook(userProps) : doHook;
};

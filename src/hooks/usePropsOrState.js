import { shallowEqual, useStore, useSelector } from 'react-redux';
import { isFunction, isObject } from '../utils/eq.js';

// the below uses useSelector from react-redux to do the heavy lifting, because I don't
// want to have to reimplement their subscription tree stuff from scratch just yet

const SELECTED_FN = Symbol('_selectedFn');
const ORIG_FN = Symbol('_origFn');

export const propFnsEqual = (prevFn, nextFn) => {
    const prevOrigFn = prevFn[ORIG_FN], nextOrigFn = nextFn[ORIG_FN];

    // user "selected" functions are always assumed to be equal,
    // otherwise perform reference equality to determine if the prop changed
    if (prevOrigFn[SELECTED_FN] && nextOrigFn[SELECTED_FN]) return true;
    else return Object.is(prevOrigFn, nextOrigFn);
};

// heuristic equality check, if the user needs a deep equality check they'll need to &&
// a deep array equality check on in their own propEqualsFn below
export const propsEqual = (nextProps, prevProps) => {
    const nextKeys = Object.keys(nextProps),
        prevKeys = Object.keys(prevProps);

    if (nextKeys.length !== prevKeys.length) return false;

    return nextKeys.every(k => {
        const np = nextProps[k], pp = prevProps[k];

        // this is a bit iffy, because it implies that for every prop we're doing
        // a shallow equality check
        if (isFunction(np) && isFunction(pp)) return propFnsEqual(np, pp);
        else return shallowEqual(np, pp);
    });
};

export const usePropsOrState = (selector = () => undefined, userEqualFn = propsEqual, userProps) => {
    const doHook = props => {
        const store = useStore();
        const nextProps = useSelector(s => {
            const stateProps = selector(s);

            // mark functions returned from the selector
            // these will always compare equal for rendering's sake, even though the
            // function references will potentially differ
            stateProps && Object.values(stateProps).forEach(v => {
                if (isFunction(v))
                    v[SELECTED_FN] = true;
            });

            const nextProps = {
                ...stateProps,
                ...props
            };

            Object.keys(nextProps).forEach(key => {
                let fn;
                if (isFunction(fn = nextProps[key])) {
                    // pin dispatch and the state getter
                    // to the first parameter, which will more often than not be an event
                    const usePropsOrStateWrapper = (maybeE = {}, ...rest) => {
                        if (maybeE?.nativeEvent) {
                            maybeE.$dispatch = store.dispatch;
                            maybeE.$getState = store.getState;
                        }

                        return fn(maybeE, ...rest);
                    };

                    // cache the original function for the rendering equality check below
                    usePropsOrStateWrapper[ORIG_FN] = fn;
                    nextProps[key] = usePropsOrStateWrapper;
                }
            });

            return Object.freeze(nextProps);
        }, userEqualFn);

        return nextProps;
    };

    // the user provided props, but overwrote the equality function in the process
    if (isObject(userEqualFn)) {
        userProps = userEqualFn;
        userEqualFn = () => true;
    }

    // curried to allow for composition
    return userProps ? doHook(userProps) : doHook;
};

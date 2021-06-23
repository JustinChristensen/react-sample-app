import PropTypes from 'prop-types';
import { createContext, useLayoutEffect, useMemo, useContext, useRef, useReducer } from 'react';
import { isUndefined, refEq } from './eq.js';

export const ReduxContext = createContext(null);

let subId = 0;

export const subscribersList = () => new Map();

export const notifySubs = subscribers => {
    console.debug(`notifying ${subscribers.size} subscribers of a change`);
    subscribers.forEach(fn => fn());
};

export const addSub = (subscribers, fn) => {
    const handle = subId++;
    subscribers.set(handle, fn);
    return handle;
};

export const removeSub = (subscribers, handle) => subscribers.delete(handle);

export const useSubscription = fn => {
    const { store, subscribers } = useContext(ReduxContext) || {};

    useLayoutEffect(() => {
        if (subscribers) {
            const handle = addSub(subscribers, fn);
            return () => removeSub(subscribers, handle);
        }
    }, [store, subscribers]);
};

export const useSelector = (selector, userEqualFn = refEq) => {
    const { store } = useContext(ReduxContext) || {};
    const [, forceRender] = useReducer(s => s + 1, 0);

    const lastSelectedState = useRef();

    if (store && isUndefined(lastSelectedState.current))
        lastSelectedState.current = selector(store.getState());

    useSubscription(() => {
        const selectedState = selector(store.getState());

        if (!userEqualFn(selectedState, lastSelectedState.current))
            forceRender();

        lastSelectedState.current = selectedState;
    });

    return lastSelectedState.current;
};

export const useStore = () => {
    const context = useContext(ReduxContext);
    return context?.store;
};

// This primarily exists in this project for a few reasons:
//      1. Because useReduxContext requires there to be an ancestor Provider
//          further up the tree, or it errors otherwise
//      2. Because useSelector expects state
//      3. Because I want to be able to report details of how many active subscriptions
//          to the store from the components there are
// I want to be able to optionally have my components disconnected from the store
// and for usePropsOrState to softly skip calling the selector function when there
// is no context available
export const Provider = ({ store, children }) => {
    const contextValue = useMemo(() => ({
        store,
        subscribers: subscribersList()
    }), [store]);

    useLayoutEffect(() => {
        const { store, subscribers } = contextValue;
        return store.subscribe(() => notifySubs(subscribers));
    }, [contextValue]);

    return <ReduxContext.Provider value={contextValue}>{children}</ReduxContext.Provider>;
};

Provider.propTypes = {
    store: PropTypes.shape({
        subscribe: PropTypes.func.isRequired,
        dispatch: PropTypes.func.isRequired,
        getState: PropTypes.func.isRequired,
    }),
    children: PropTypes.any
};

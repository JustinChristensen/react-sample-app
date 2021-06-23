import PropTypes from 'prop-types';
import { createContext, useLayoutEffect, useMemo } from 'react';

export const ReduxContext = createContext(null);
export const subscribersList = () => new Map();

export const notifySubs = subscribers => {
    console.debug(`notifying ${subscribers.size} subscribers of a change`);
    subscribers.forEach(fn => fn());
};

// global scratch-pad for things like promises and other handles within events
const eventContext = {};

// This primarily exists in this project for a few reasons:
//      1. Because useReduxContext requires there to be an ancestor Provider
//          further up the tree, or it errors otherwise
//      2. Because useSelector expects state
//      3. Because I want to be able to report details of how many active subscriptions
//          to the store from the components there are
// I want to be able to optionally have my components disconnected from the store
// and for usePropsSelector to softly skip calling the selector function when there
// is no context available
export const Provider = ({ store, children }) => {
    const contextValue = useMemo(() => ({
        eventContext,
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

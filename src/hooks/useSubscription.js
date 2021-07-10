import { useLayoutEffect, useContext } from 'react';
import { ReduxContext } from '../components/ReduxContext.jsx';

let subUid = 0;

export const addSub = (subscribers, fn) => {
    const handle = subUid++;
    subscribers.set(handle, fn);
    return handle;
};

export const removeSub = (subscribers, handle) => subscribers.delete(handle);

export const useSubscription = fn => {
    const { store, subscribers } = useContext(ReduxContext) || {};

    useLayoutEffect(() => {
        if (!subscribers) return;
        const handle = addSub(subscribers, fn);
        return () => removeSub(subscribers, handle);
    }, [store, subscribers]);
};


import { useContext, useRef, useReducer } from 'react';
import { useSubscription } from './useSubscription.js';
import { isUndefined, refEq } from '../utils/eq.js';
import { ReduxContext } from '../components/ReduxContext.jsx';

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


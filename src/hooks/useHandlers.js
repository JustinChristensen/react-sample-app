import { useContext } from 'react';
import { ReduxContext } from '../components/ReduxContext.jsx';
import { isFunction} from '../utils/eq.js';

const defineProp = (o, key, value) => Object.defineProperty(o, key, { value });

const addContextToEvents = props => {
    const context = useContext(ReduxContext);

    if (!context) return props;

    const { eventContext, store } = context;

    Object.keys(props).forEach(key => {
        let fn;
        if (isFunction(fn = props[key])) {
            // pin dispatch and the state getter
            // to the first parameter, which will more often than not be an event
            const usePropsSelectorWrapper = (maybeE, ...rest) => {
                if (maybeE?.nativeEvent) {
                    // todo: make these unwritable
                    defineProp(maybeE, '$context', eventContext);
                    defineProp(maybeE, '$dispatch', store.dispatch);
                    defineProp(maybeE, '$getState', store.getState);
                }

                return fn(maybeE, ...rest);
            };

            props[key] = usePropsSelectorWrapper;
        }
    });

    return props;
};

export const useHandlers = (handlers, userProps) => {
    const doHook = props => {
        return Object.freeze(addContextToEvents({
            ...handlers,
            ...props
        }));
    };

    // curried to allow for composition
    return userProps ? doHook(userProps) : doHook;
};

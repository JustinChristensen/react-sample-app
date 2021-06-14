import produce from 'immer';

// just trying some stuff out, yes I know redux toolkit is a thing

const mappedReducer = () => {
    const newReducer = produce((state, action) => {
        const red = newReducer.reducerMap[action.type];
        return red ? red(state, action.data, action.type) : state;
    });

    return newReducer;
};

export const reducer = (actionType, reducerFn) => {
    const newReducer = mappedReducer();

    const creator = data => ({
        type: actionType,
        data: data
    });

    creator.toString = () => actionType;

    newReducer.actions = { [actionType]: creator };
    newReducer.reducerMap = { [actionType]: reducerFn };

    return newReducer;
};

export const composeReducer = (redf, redg) => {
    const newReducer = mappedReducer();

    newReducer.actions = {
        ...redf.actions,
        ...redg.actions
    };

    newReducer.reducerMap = {
        ...redf.reducerMap,
        ...redg.reducerMap
    };

    return newReducer;
};

export const composeReducers = (...reds) => reds.flat().reduce(composeReducer);

export const useDefaults = (defaults, userProps) => {
    const doHook = props => Object.freeze({
        ...defaults,
        ...props
    });

    return userProps ? doHook(userProps) : doHook;
};

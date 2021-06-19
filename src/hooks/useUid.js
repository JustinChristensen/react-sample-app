let uid = 0;

// a pseudo-hook to inject a globally unique $uid into a component's props
export const useUid = userProps => {
    const doHook = props => Object.freeze({
        ...props,
        $uid: props.$uid ?? uid++
    });

    return userProps ? doHook(userProps) : doHook;
};

let uid = 0;

// a pseudo-hook to inject a globally unique $uid into a component's props
export const useUid = userProps => {
    const doHook = props => Object.freeze({
        $uid: props.$uid ?? uid++,
        ...props
    });

    return userProps ? doHook(userProps) : doHook;
};

import { useRef } from 'react';

let uid = 0;

// a pseudo-hook to inject a globally unique $uid into a component's props
export const useUid = userProps => {
    const lastUid = useRef();

    lastUid.current ??= uid++;

    const doHook = props => Object.freeze({
        $uid: props.$uid ?? lastUid.current,
        ...props
    });

    return userProps ? doHook(userProps) : doHook;
};

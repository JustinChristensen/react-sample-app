import getDispName from './getDispName.js';

let uid = 0;

export const WithUid = component => {
    const uidComponent = props => {
        return component({ 
            ...props,
            $uid: props.$uid ?? uid++
        });
    };

    uidComponent.displayName = `WithUid(${getDispName(component)})`;

    return uidComponent;
};
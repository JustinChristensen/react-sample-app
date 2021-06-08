export const Named = name => component => {
    component.displayName = name;
    return component;
};
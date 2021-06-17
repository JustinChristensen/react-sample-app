export const get = (obj, path, defVal) =>
    path.split('.').reduce((o, part) => o && o[part], obj) || defVal;

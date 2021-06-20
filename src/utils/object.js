export const get = (obj, path, defVal) =>
    path.split('.').reduce((o, part) => o && o[part], obj) || defVal;

export const invert = obj => Object.entries(obj)
    .reduce((o, [k, v]) => (o[v] = k, o), {});

export const suffixWith = (str, ...fields) =>
    fields.flat().map(f => f + str);

export const classes = (...cs) => Array.from(new Set(cs.flat())).join(' ');

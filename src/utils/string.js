export const dashes = (...strs) => strs.flat().join('-');

export const suffixWith = (str, ...fields) => 
    fields.flat().map(f => f + str);
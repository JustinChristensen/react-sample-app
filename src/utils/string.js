export const suffixWith = (str, ...fields) =>
    fields.flat().map(f => f + str);

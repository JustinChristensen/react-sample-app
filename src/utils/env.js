export const env = process.env.NODE_ENV;
export const prodOrNot = (prod, not) => env === 'production' ? prod : not;

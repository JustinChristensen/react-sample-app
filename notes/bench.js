const { performance } = require('perf_hooks');

const now = performance.now;

const rand = i => Math.floor(Math.random() * i);

const times = (n, fn) => {
    for (let i = 0; i < n; i++) fn(i);
};

const bench = (fn, ...args) => {
    const start = now();
    fn(...args);
    return now() - start;
};

module.exports = {
    bench,
    times,
    rand
}

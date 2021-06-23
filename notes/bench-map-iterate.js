const { v4: uuid } = require('uuid');
const { bench, times, rand } = require('./bench.js');

console.log('map:');

let N = 1000000;
let timings = {};
while (N <= 1000000) {
    const map = new Map();

    times(N, i => {
        map.set(i, () => i);
    });

    let t;
    const time = bench(() => {
        t = 0;
        map.forEach(fn => t += fn());
    }) * 1000;

    console.log(`total after iteration: ${t}`);

    timings[N] = `iterated ${N} elements in ${time} microseconds`

    N *= 10;
}

console.log(timings);

console.log('linked list:');

N = 1000000;
timings = {};
while (N <= 1000000) {
    let head = null, last = null;

    times(N, i => {
        last = { fn: () => i, prev: last, next: null };
        if (last.prev) last.prev.next = last;
        if (!head) head = last;
    });

    let t;
    const time = bench(() => {
        let node = head;
        t = 0;
        while (node) {
            t += node.fn();
            node = node.next;
        }
    }) * 1000;

    console.log(`total after iteration: ${t}`);

    timings[N] = `iterated ${N} elements in ${time} microseconds`

    N *= 10;
}

console.log(timings);


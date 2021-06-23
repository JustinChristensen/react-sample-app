const { v4: uuid } = require('uuid');
const { bench, times, rand } = require('./bench.js');

const timings = {};

let N = 100;
while (N <= 1000000) {
    const keys = [];
    const map = new Map();

    times(N, () => {
        const key = uuid();
        map.set(key, uuid());
        if (rand(15) === 0) keys.push(key);
    });

    console.log(`map has ${map.size} keys`);

    const klen = keys.length;
    console.log(`deleting ${klen} keys...`);

    let worst = 0, average = 0;
    keys.forEach(k => {
        const time = bench(() => {
            map.delete(k);
        }) * 1000;  // in microseconds

        worst = worst < time ? time : worst;
        average += time / klen;
    });

    console.log(`map now has ${map.size} keys`);

    timings[N] = `worst: ${worst}, average: ${average} (in microseconds)`;

    N *= 10;
}

console.log(timings);


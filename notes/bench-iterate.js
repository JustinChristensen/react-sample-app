const { bench, times, rand } = require('./bench.js');

console.log('array iteration');

N = 10000000;
const timings = {};
while (N <= 10000000) {
    const arr = [];

    times(N, i => {
        arr[i] = i;
    });

    let t;
    const loopTime = bench(() => {
        t = 0;
        for (let i = 0; i < arr.length; i++)
            t += arr[i];
    }) * 1000;

    console.log(`result: ${t}`);

    const forEachTime = bench(() => {
        t = 0;
        arr.forEach(i => t += arr[i]);
    }) * 1000;

    console.log(`result: ${t}`);


    timings.loop = { [N]: `${N} elements in ${loopTime} microseconds` };
    timings.forEach = { [N]: `${N} elements in ${loopTime} microseconds` };

    N *= 10;
}

console.log(timings);

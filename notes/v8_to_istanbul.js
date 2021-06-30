const { readFileSync } = require('fs');

const encodingTable = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
    'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
    'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
    'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
    'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
    'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
    'w', 'x', 'y', 'z', '0', '1', '2', '3',
    '4', '5', '6', '7', '8', '9', '+', '/'
];

const decodingTable = encodingTable.reduce((table, digit, i) =>
    (table[digit.charCodeAt(0)] = i, table), Array(encodingTable.length));

const decodeSegment = (segment, counters) => {
    const fields = [0]; // generated offset, set below in markSegments

    let i = 0;
    while (i < segment.length) {
        let digit = decodingTable[segment[i++].charCodeAt(0)];
        // handle the leading sign bit
        const neg = digit & 0b1;
        let n = (digit >> 1) & 0b1111;
        // start out shifted over by 4 (and then increment by 5 for each additional digit)
        let shift = 4;
        // while the continuation bit is set
        while (digit & 0b100000) {
            digit = decodingTable[segment[i++].charCodeAt(0)];
            n |= (digit & 0b11111) << shift;
            shift += 5;
        }

        fields.push(neg ? -n : n);
    }

    // convert from relative to absolute
    for (i = 2; i < fields.length; i++) {
        counters[i] += fields[i];
        fields[i] = counters[i];
    }

    return fields;
};

const decodeGroup = (group, counters) => {
    if (group === '') return undefined;
    return group.split(',').map(segment => decodeSegment(segment, counters));
};

const decodeMappings = mappings => {
    // generated offset, generated column, source, source line, source col, name
    const counters = [ 0, 0, 0, 0, 0, 0 ];
    return mappings.split(';').map(group => decodeGroup(group, counters));
};

const readSourceMap = path => {
    const sourceMap = JSON.parse(readFileSync(path));
    // remove that leading pseudo-protocol thing that webpack adds
    sourceMap.sources = sourceMap.sources.map(s => s.replace(/^\w+:\/\//, ''));
    return sourceMap;
};

// TODO: unicode
// const v8toIstanbul = (entry, sourceMap) => {
// };

const markSegments = (decodedGroups, entry) => {
    const { source: generated } = entry;

    let p = 0;  // position
    let col = 0;

    let g = 0;  // group
    let group = decodedGroups[g++];

    let s = 0;
    let segment;

    if (group && s < group.length && group[s][1] === col) {
        segment = group[s++];
        segment[0] = p;
    }

    while (p < generated.length) {
        if (generated[p] === '\n') {
            group = decodedGroups[g++];
            segment = undefined;
            col = 0;
            s = 0;
        } else {
            col++;
        }

        p++;

        if (group && s < group.length && group[s][1] === col) {
            segment = group[s++];
            segment[0] = p;
        }
    }

    return decodedGroups;
};

const printMain = (sourceMap, entry) => {
    const decodedGroups = markSegments(decodeMappings(sourceMap.mappings), entry);
    const mainLines = entry.source.split('\n');

    let lastSource = undefined;
    decodedGroups.forEach((group, i) => {
        const locations = group ? group.map(segment => {
            let loc = `${segment[0]}:${segment[1]}`;

            if (segment[2] !== undefined) {
                if (lastSource !== segment[2]) {
                    loc += `:${sourceMap.sources[segment[2]]}`;
                    lastSource = segment[2];
                }
                loc += `:${segment[3]}:${segment[4]}`;
                if (segment[5] !== undefined) loc += `:${sourceMap.names[segment[5]]}`;
            }

            return loc;
        }).join(',') : '';

        console.log('%s | %s', locations.padEnd(80), mainLines[i]);
    });
};

const sourceMap = readSourceMap('./sourcemap.json');
const entry = JSON.parse(readFileSync('./entry.json'));

printMain(sourceMap, entry);



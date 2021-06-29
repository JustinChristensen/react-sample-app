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

const sourcemap = JSON.parse(readFileSync('./sourcemap.json'));
const mainFile = readFileSync('./main.js', 'utf8');

const mappings = sourcemap.mappings;

const groupMappings = mappings.split(';').map(group => {
    if (group === '') return [];

    return group.split(',').map(segment => {
        const fields = [];

        if (/[A-Za-z0-9+/]+/g.test(segment)) {
            let i = 0;
            while (i < segment.length) {
                let digit = decodingTable[segment[i++].charCodeAt(0)];
                const neg = digit & 0b1;
                let n = (digit >> 1) & 0b1111;
                let shift = 4;
                while (digit & 0b100000) {
                    digit = decodingTable[segment[i++].charCodeAt(0)];
                    n |= (digit & 0b11111) << shift;
                    shift += 5;
                }

                fields.push(neg ? -n : n);
            }
        }

        return fields;
    });
})

const lineMappings = mappings.split(';');

const mainLines = mainFile.split('\n');

sourcemap.sources = sourcemap.sources.map(s => s.replace('webpack://', ''));

let source = 0, sourceLine = 0, sourceCol = 0, name = 0;
let first = true;

groupMappings.forEach((segments, i) => {
    let locations = segments.map(([genCol, src, sl, sc, na]) => {
        let loc = `[${genCol}]:`;

        if (src !== undefined) {
            let sym = '';

            const nextSource = source + src;
            sourceLine += sl;
            sourceCol += sc;

            let srcPath = '';

            if (first || nextSource !== source)
                srcPath = `${sourcemap.sources[nextSource]}:`;

            first = false;
            source = nextSource;

            if (na !== undefined) {
                name += na;
                sym = `:${sourcemap.names[name]}`;
            }

            loc += `${srcPath}${sourceLine}:${sourceCol}${sym}`;
        }

        return loc;
    });

    const MAPPING_LIMIT = 25,
        LOCATIONS_LIMIT = 80;

    let lineMapping = lineMappings[i];
    if (lineMapping.length > MAPPING_LIMIT)
        lineMapping = lineMapping.slice(0, MAPPING_LIMIT - 3) + '...';

    locations = locations.join(',');
    if (locations.length > LOCATIONS_LIMIT)
        locations = locations.slice(0, LOCATIONS_LIMIT - 3) + '...';

    console.log('%s | %s | %s', lineMapping.padEnd(MAPPING_LIMIT), locations.padEnd(LOCATIONS_LIMIT), mainLines[i]);
});

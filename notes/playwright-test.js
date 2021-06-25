const { createCoverageMap } = require('istanbul-lib-coverage');
const { createContext } = require('istanbul-lib-report');
const { create: createReporter } = require('istanbul-reports');
const { chromium } = require('playwright');
const v8ToIstanbul = require('v8-to-istanbul');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.coverage.startJSCoverage();
    await page.goto('http://localhost:3000');
    await new Promise(resolve => setTimeout(() => resolve(), 1000));
    const coverage = await page.coverage.stopJSCoverage();

    const coverageMap = createCoverageMap();

    await Promise.all(coverage.map(async entry => {
        const convertor = v8ToIstanbul('', 0, { source: entry.source });
        await convertor.load();
        convertor.applyCoverage(entry.functions);
        coverageMap.merge(convertor.toIstanbul());
    }));

    coverageMap.filter(file => !/node_modules|webpack|\?/.test(file));

    console.log(coverageMap);

    const reportContext = createContext({ coverageMap });

    ['json', 'text', 'lcov'].forEach(reporter => {
        createReporter(reporter).execute(reportContext);
    });

    await browser.close();
})();

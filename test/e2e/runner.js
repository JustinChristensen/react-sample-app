const { createCoverageMap } = require('istanbul-lib-coverage');
const { createContext } = require('istanbul-lib-report');
const { create: createReporter } = require('istanbul-reports');
const { chromium } = require('playwright');
const v8ToIstanbul = require('v8-to-istanbul');

const identity = x => x;
const compose2 = (f, g) => x => g(f(x));
const compose = (...fns) => fns.flat().reduce(compose2, identity);

const state = (stateFn, optionalTag) => ({
    fn: stateFn,
    actions: {},
    tag: optionalTag ?? ''
});

const action = (action, nextState, actionFn, state) => {
    const makeAction = state => {
        if (!state) throw new Error('state is required');
        if (!action) throw new Error('action is required');
        if (state.actions[action]) throw new Error(`action ${action} already already defined for state ${state.tag}`);
        state.actions[action] = [actionFn, nextState];
        return state;
    };

    return state ? makeAction(state) : makeAction;
};

const checkPath = (state, actions = []) =>
    actions.reduce((reached, action) => {
        if (!state.actions[action]) return reached;
        reached.push(action);
        state = state.actions[action][1];
        return reached;
    }, []);

const startCoverage = async page =>
    await page.coverage.startJSCoverage();

const stopCoverage = async (coverageMap, page) => {
    const coverage = await page.coverage.stopJSCoverage();

    await Promise.all(coverage.map(async entry => {
        const convertor = v8ToIstanbul('', 0, { source: entry.source });
        await convertor.load();
        convertor.applyCoverage(entry.functions);
        coverageMap.merge(convertor.toIstanbul());
    }));
};

const reportCoverage = coverageMap => {
    coverageMap.filter(file => !/node_modules|webpack|\?/.test(file));
    const reportContext = createContext({ coverageMap });

    ['json', 'text', 'lcov'].forEach(reporter => {
        createReporter(reporter).execute(reportContext);
    });
};

const isArray = Array.isArray;
const isString = s => typeof s === 'string';
const isObject = o => String(o) === '[object Object]';

const asyncForEach = (arr, fn) =>
    arr.reduce((promise, x) => promise.then(() => fn(x)), Promise.resolve());

const launch = async (startState, browserOpts, launchFn) => {
    const browser = await chromium.launch(browserOpts);
    const coverageMap = createCoverageMap();

    const run = async (pageOpts, ...actions) => {
        if (isString(pageOpts)) pageOpts = [pageOpts];
        if (isArray(pageOpts)) actions = pageOpts.concat(actions);
        actions = actions.flat();

        const page = await browser.newPage(isObject(pageOpts) ? pageOpts : undefined);

        const reached = checkPath(startState, actions);
        if (reached.length !== actions.length) throw new Error(`Route not found:\nReached: ${reached}\nProvided: ${actions}`);

        await startCoverage(page);

        const runContext = { browser, page, context: {} };
        let state = startState;
        await asyncForEach(actions, async action => {
            const [actionFn, nextState] = state.actions[action];
            await actionFn(runContext);
            await nextState.fn(runContext);
            state = nextState;
        });

        await stopCoverage(coverageMap, page);
    };

    await launchFn({ browser, run });
    reportCoverage(coverageMap);
    await browser.close();
};

module.exports = {
    actions: compose,
    start: state(),
    state,
    action,
    launch
};

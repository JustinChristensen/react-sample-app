const { createCoverageMap } = require('istanbul-lib-coverage');
const { createContext } = require('istanbul-lib-report');
const { create: createReporter } = require('istanbul-reports');
const { chromium } = require('playwright');
const v8ToIstanbul = require('v8-to-istanbul');

const isArray = Array.isArray;
const isString = s => typeof s === 'string';
const isObject = o => String(o) === '[object Object]';

const asyncReduce = (arr, fn, init) =>
    arr.reduce((promise, x) => promise.then(memo => fn(memo, x)), Promise.resolve(init));

const asyncForEach = (arr, fn) => asyncReduce(arr, (_, x) => fn(x));

let uid = 0;
const state = (stateFn, optionalTag = '') => ({
    id: uid++,
    fn: stateFn,
    actions: {},
    epsilons: [],
    tag: optionalTag
});

const action = (state, action, nextState, actionFn) => {
    if (!state) throw new Error('state is required');

    const addAction = (action, nextState, actionFn) => {
        if (!action) throw new Error('action is required');
        if (state.actions[action]) throw new Error(`action ${action} already already defined for state ${state.tag}`);
        state.actions[action] = [actionFn, nextState];
    };

    return action ? addAction(action, nextState, actionFn) : addAction;
};

const isActionSpec = maybeSpec => maybeSpec && isString(maybeSpec[0]);

const actions = (state, epsilons, ...actionSpecs) => {
    if (isActionSpec(epsilons)) {
        actionSpecs = [epsilons].concat(actionSpecs);
        epsilons = undefined;
    }

    if (epsilons) state.epsilons.push(...epsilons);
    actionSpecs.forEach(spec => action(state, ...spec));
};

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

const close = (...states) => {
    states = states.flat();

    const root = [], epsilons = [];
    const rootSet = new Set(states.map(s => s.id));
    const visited = new Set();
    const stack = [...states];
    let state;

    while (stack.length) {
        state = stack.pop();
        if (visited.has(state.id)) continue;
        visited.add(state.id);

        // root set states will have priority
        if (rootSet.has(state.id)) root.push(state);
        else epsilons.push(state);

        stack.push(...state.epsilons);
    }

    return [root, epsilons];
};

const checkPath = (states, actions = []) => {
    states = close(states).flat();

    return actions.reduce((reached, action) => {
        states = close(states.reduce((nextStates, state) => {
            if (!state.actions[action]) return nextStates;
            nextStates.push(state.actions[action][1]);
            return nextStates;
        }, [])).flat();

        if (states.length) reached.push(action);

        return reached;
    }, []);
};

const launch = async (startState, browserOpts, launchFn) => {
    const browser = await chromium.launch(browserOpts);
    const coverageMap = createCoverageMap();

    const run = async (pageOpts, ...actions) => {
        actions = actions.flat();
        if (isString(pageOpts)) pageOpts = [pageOpts];
        if (isArray(pageOpts)) actions = pageOpts.concat(actions);

        const reached = checkPath(startState, actions);
        if (reached.length !== actions.length)
            throw new Error(`Action route not found.\nReached: ${JSON.stringify(reached)}\nProvided: ${JSON.stringify(actions)}`);

        const page = await browser.newPage(isObject(pageOpts) ? pageOpts : undefined);
        const runContext = Object.freeze({ browser, page, context: {} });

        const tryWith = action => async (nextStates, state) => {
            if (!state.actions[action]) return nextStates;

            await state.fn(runContext);
            const [actionFn, nextState] = state.actions[action];
            await actionFn(runContext);

            nextStates.push(nextState);

            return nextStates;
        };

        await startCoverage(page);

        let first = true;
        let [root, epsilon] = close(startState);
        await asyncForEach(actions, async action => {
            if (!first) process.stdout.write(' > ');
            process.stdout.write(action);
            first = false;
            const tryState = tryWith(action);

            // scan the root set for viable transitions on the action
            root = await asyncReduce(root, tryState, []);

            // we found transitions in the root set, no need to scan the epsilons
            if (root.length) {
                [root, epsilon] = close(root);
                return;
            }

            // scan the epsilons
            [root, epsilon] = close(await asyncReduce(epsilon, tryState, []));
        });

        process.stdout.write('\n');

        await stopCoverage(coverageMap, page);
    };

    await launchFn({ browser, run });
    reportCoverage(coverageMap);
    await browser.close();
};

module.exports = {
    start: state(() => {}),
    state,
    actions,
    launch
};

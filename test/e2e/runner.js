const { createCoverageMap } = require('istanbul-lib-coverage');
const { createContext } = require('istanbul-lib-report');
const { create: createReporter } = require('istanbul-reports');
const { chromium } = require('playwright');
const v8ToIstanbul = require('v8-to-istanbul');

// TODO:
// - does it make sense for the inner loop to potentially trigger multiple transitions for a single action?
//      i.e., should it stop after finding the first transition in either the root set or the epsilons?
// - should run return the current set of states back to the caller, so that they can be fed into another run?
//      i.e. should run be re-entrant, so that runs can be composed together?
// - think about how best to annotate a run with a description of the test, maybe something like:
//      await test('adds and deletes some employees', run('addEmployee', 'addEmployee', 'addEmployee', 'deleteEmployee'))
// - format exceptions returned from the transition and state functions
// - command line interface, that lets the user specify runs on the command line, host and port number for the target,
//      request a textual representation of the NFA graph, with state tags and actions, and so on

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

const start = state(() => {});

const action = (state, action, nextState, actionFn) => {
    if (!state) throw new Error('state is required');

    const addAction = (action, nextState, actionFn) => {
        if (!action) throw new Error('action is required');
        if (state.actions[action]) throw new Error(`action ${action} already already defined for state ${state.tag}`);
        state.actions[action] = [actionFn, nextState];
    };

    return action ? addAction(action, nextState, actionFn) : addAction;
};

const actions = (state, ...actionSpecs) =>
    actionSpecs.forEach(spec => {
        if (isObject(spec[0])) {
            state.epsilons.push(...spec);
            return;
        }

        action(state, ...spec);
    });

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

    ['json', 'text', 'html'].forEach(reporter => {
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

const launch = async (browserOpts, launchFn) => {
    const browser = await chromium.launch(browserOpts);
    const coverageMap = createCoverageMap();

    const run = async (pageOpts, ...actions) => {
        actions = actions.flat();
        if (isString(pageOpts)) pageOpts = [pageOpts];
        if (isArray(pageOpts)) actions = pageOpts.concat(actions);

        const reached = checkPath(start, actions);
        if (reached.length !== actions.length)
            throw new Error(`Action route not found.\nReached: ${JSON.stringify(reached)}\nProvided: ${JSON.stringify(actions)}`);

        const page = await browser.newPage(isObject(pageOpts) ? pageOpts : undefined);
        const fixtures = Object.freeze({ browser, page, context: {} });

        await startCoverage(page);

        let first = true;
        let [root, epsilon] = close(start);
        await asyncForEach(actions, async action => {
            if (!first) process.stdout.write(' > ');
            process.stdout.write(action);
            first = false;

            const tryState = async (nextStates, state) => {
                if (!state.actions[action]) return nextStates;

                const [actionFn, nextState] = state.actions[action];
                await actionFn(fixtures);
                // eagerly execute the next state function
                // this should be fine, because we're explicitly giving root states
                // precedence over epsilon states, and the number of transitions should
                // then be fairly limited for each action
                await nextState.fn(fixtures);

                nextStates.push(nextState);

                return nextStates;
            };

            // scan the root set for viable transitions on the action
            root = await asyncReduce(root, tryState, []);

            // we found transitions in the root set, no need to scan the epsilons
            if (root.length) {
                [root, epsilon] = close(root);
                return;
            }

            // no transitions found, scan the epsilons
            [root, epsilon] = close(await asyncReduce(epsilon, tryState, []));
        });

        process.stdout.write('\n');

        await stopCoverage(coverageMap, page);
    };

    const runAll = (...runs) => Promise.all(runs.flat());

    await launchFn({ browser, run, runAll });
    reportCoverage(coverageMap);
    await browser.close();
};

module.exports = {
    start,
    state,
    actions,
    launch
};

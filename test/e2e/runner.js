const { createCoverageMap } = require('istanbul-lib-coverage');
const { createContext } = require('istanbul-lib-report');
const { create: createReporter } = require('istanbul-reports');
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const os = require('os');
const path = require('path');
const pkg = require('../../package.json');
const assert = require('assert/strict');
const v8ToIstanbul = require('v8-to-istanbul');

// TODO:
// - should run return the current set of states back to the caller, so that they can be fed into another run?
//      i.e. should run be re-entrant, so that runs can be composed together?
// - think about how best to annotate a run with a description of the test, maybe something like:
//      await test('adds and deletes some employees', run('addEmployee', 'addEmployee', 'addEmployee', 'deleteEmployee'))
// - group transitions into an array:
//      const addThreeEmployees = Array(3).fill('addEmployee');
//      run('goHome', addThreeEmployees, ...)
// - format exceptions thrown from the transition and state functions
// - command line interface, that lets the user specify runs on the command line, host and port number for the target,
//      request a textual representation of the NFA graph, with state tags and actions, and so on
// - use assertions instead of throwing errors
// - timings and logging
// - API for loading data from external sources prior to the test run (so you can select elements from the UI based on data in the UI's environment)

const isArray = Array.isArray;
const isString = s => typeof s === 'string';
const isFunction = f => typeof f === 'function';
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
    assert(state, 'state is required');

    const addAction = (action, nextState, actionFn) => {
        assert(action, 'action is required');
        assert(!state.actions[action], `action ${action} already already defined for state ${state.tag}`);
        state.actions[action] = [actionFn, nextState];
    };

    return action ? addAction(action, nextState, actionFn) : addAction;
};

const actions = (state, ...actionSpecs) =>
    actionSpecs.forEach(spec => {
        if (isObject(spec[0])) {
            state.epsilons.push(...spec);
            return;
        } else if (isFunction(spec[0])) {
            action(state, spec[0].name, spec[1], spec[0]);
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

const defaultExecPath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const defaultArgs = [
    '--remote-debugging-port=0',
    '--no-startup-window',
    '--enable-automation',
    '--no-first-run'
];

const defaultOptions = {
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe']
};

const DETACH_TIMEOUT = 3000;

class DevToolsTimeoutError extends Error {
    constructor(timeout) {
        super(`Process launched, but no devtools server could be found within ${timeout} milliseconds`);
        this.name = 'DevToolsTimeoutError';
    }
}

const terminate = proc => proc.kill() || proc.kill('SIGKILL');

const spawnDetached  = (args = defaultArgs, options = defaultOptions, execPath = defaultExecPath) => new Promise((resolve, reject) => {
    args = args.concat(`--user-data-dir=${path.join(os.tmpdir(), `${pkg.name}-chromedata`)}`);

    const chrome = spawn(execPath, args, options);
    chrome.unref();

    const timeoutId = setTimeout(() => {
        terminate(chrome);
        reject(new DevToolsTimeoutError(DETACH_TIMEOUT));
    }, DETACH_TIMEOUT);

    chrome.stderr.on('data', data => {
        const m = String(data).match(/devtools listening on (ws:\/\/\S+)/i);
        if (m) {
            clearTimeout(timeoutId);
            resolve(m[1]);
        }
    });
    chrome.on('error', err => {
        clearTimeout(timeoutId);
        reject(err);
    });
});

const launch = async (browserOpts, launchFn) => {
    const detached = process.env.DETACHED !== undefined;
    let browser;

    if (detached) {
        browser = await chromium.connectOverCDP({ endpointURL: await spawnDetached(), timeout: 2000 });
    } else {
        browser = await chromium.launch(browserOpts);
    }

    const coverageMap = createCoverageMap();
    let uid = 0;
    const lines = [];

    const makeLog = () => {
        const id = uid++;
        lines[id] = '';

        // TODO: figure out a way to allow the user to continue console.logging,
        // but also prepend these to the output
        return str => {
            lines[id] += str;
            console.clear();
            lines.forEach(li => console.log(li));
        };
    };

    const run = async (pageOpts, ...actions) => {
        actions = actions.flat();
        if (isString(pageOpts)) pageOpts = [pageOpts];
        if (isArray(pageOpts)) actions = pageOpts.concat(actions);

        const reached = checkPath(start, actions);
        assert(reached.length === actions.length,
            `Action route not found.\nReached: ${JSON.stringify(reached)}\nProvided: ${JSON.stringify(actions)}`);

        const writeToLine = makeLog();

        const page = await browser.newPage(isObject(pageOpts) ? pageOpts : undefined);
        const fixtures = Object.freeze({ browser, page, context: {} });

        writeToLine('| ');

        await startCoverage(page);

        let first = true;
        let [root, epsilon] = close(start);
        await asyncForEach(actions, async action => {
            if (!first) writeToLine(' > ');
            writeToLine(action);
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

            // scan the root set for viable transitions on the action (and make any that are found)
            root = await asyncReduce(root, tryState, []);

            // we found transitions in the root set, no need to scan the epsilons
            if (root.length) {
                [root, epsilon] = close(root);
                return;
            }

            // no transitions found, scan the epsilons
            [root, epsilon] = close(await asyncReduce(epsilon, tryState, []));
        });

        await stopCoverage(coverageMap, page);
    };

    const runAll = (...runs) => Promise.all(runs.flat());

    await launchFn({ browser, run, runAll });
    reportCoverage(coverageMap);
    if (!detached) await browser.close();
};

module.exports = {
    start,
    state,
    actions,
    launch
};

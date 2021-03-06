import { createStore as reduxStore, applyMiddleware } from 'redux';
import { render } from 'react-dom';
import { Provider } from './components/ReduxContext.jsx';
import { createLogger } from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer, { actions } from './reducers';
import { env } from './utils/env.js';
import App from './components/App.jsx';
import { detectBrowserLocale, fetchMissingMessages } from './lang.js';

export const STORAGE_KEY = 'RM9000';

export const fetchMessages = (app = {}) => new Promise((resolve, reject) => {
    const store = app.store;

    // the user may not have a default locale set, so we set it here
    store.dispatch(actions.SET_LOCALE({ browserLocale: detectBrowserLocale() }));

    fetchMissingMessages(store.getState, store.dispatch).then(
        () => resolve(app),
        err => (app.initError = err, reject(app))
    );
});

export const createStore = (app = {}) => new Promise(resolve => {
    let middleware = [];

    if (env !== 'production') {
        middleware.push(createLogger());
    }

    const storageState = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    const initialState =  storageState || {
        availableLocales: [
            'us',
            'fr'
        ],
        lastEmployeeId: 1314700,
        employees: [],
        departments: [
            'Information Technology',
            'Maintenance',
            'Human Resources',
            'Business Development'
        ]
    };

    app.actions = actions;
    app.store = reduxStore(reducer, initialState,
        composeWithDevTools(applyMiddleware(...middleware)));

    resolve(app);
});

export const subscribeToUpdates = (app = {}) => new Promise(resolve => {
    const store = app.store;

    store.subscribe(() => {
        const storedState = { ...store.getState() };
        storedState.messages = undefined;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedState));
    });

    resolve(app);
});

export const loadProfiles = (app = {}) => new Promise((resolve, reject) => {
    const store = app.store;

    const { profiles } = store.getState();
    if (profiles) return resolve(app);

    fetch('profiles.json').then(resp => {
        if (!resp.ok) {
            app.initError = new Error('Failed to load profiles.');
            return reject(app);
        }
        return resp.json();
    }).then(loadedProfiles => {
        store.dispatch(actions.SET_PROFILES(loadedProfiles));
        resolve(app);
    });
});

export const renderApp = (app = {}) => new Promise(resolve => {
    app.container = document.createElement('div');
    document.body.prepend(app.container);

    render(
        <Provider store={app.store}>
            <App />
        </Provider>,
        app.container
    );

    resolve(app);
});

export const exposeApp = (app = {}) => new Promise(resolve => {
    if (env !== 'production') globalThis.app = app;
    resolve(app);
});

export default (app = {}) =>
    exposeApp(app)
        .then(createStore)
        .then(subscribeToUpdates)
        .then(loadProfiles)
        .then(fetchMessages)
        .then(renderApp);

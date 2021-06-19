import { createStore as reduxStore, applyMiddleware } from 'redux';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer, { actions } from './reducers';
import { env } from './utils/env.js';
import App from './components/App';
import worker from './sw.js';

export const STORAGE_KEY = 'RM9000';

export const registerServiceWorker = (app = {}) => new Promise((resolve, reject) => {
    navigator.serviceWorker.register(worker).then(reg => {
        reg.update();
        app.sw = reg;
        resolve(app);
    }, err => {
        app.initError = err;
        reject(app);
    });
});

// yeah, yeah, but this is a demo after all
const languageLocaleMap = {
    en: 'us',
    fr: 'fr'
};

const localeLanguageMap = Object.entries(languageLocaleMap)
    .reduce((o, [k, v]) => (o[v] = k, o), {});

export const fetchMessages = (app = {}) => new Promise(resolve => {
    const store = app.store;

    const { selectedProfile } = store.getState();

    const tryFetch = langs => {
        if (!langs.length) {
            console.log('messages not found for your locale, falling back to english...');
            return tryFetch(['en']);
        }

        const lang = langs.pop();
        return fetch(`/messages/${lang}.json`).then(resp => {
            if (!resp.ok) return tryFetch(langs);
            if (!selectedProfile.locale)
                store.dispatch(actions.SET_LOCALE(languageLocaleMap[lang]));
            return resp.json();
        });
    };

    tryFetch(selectedProfile.locale ?
        [localeLanguageMap[selectedProfile.locale]] :
        [...navigator.languages].reverse()
    ).then(messages => {
        app.store.dispatch(actions.SET_MESSAGES(messages));
        resolve(app);
    });
});

export const createStore = (app = {}) => new Promise(resolve => {
    let middleware = [];

    if (env !== 'production') {
        middleware.push(createLogger());
    }

    const storageState = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const initialState =  storageState || {
        availableLocales: [
            'us',
            'fr'
        ],
        page: {
            lastEmployeeId: 1314700,
            employees: [],
            departments: [
                'Information Technology',
                'Maintenance',
                'Human Resources',
                'Business Development'
            ]
        }
    };

    app.actions = actions;
    app.store = reduxStore(reducer, initialState,
        composeWithDevTools(applyMiddleware(...middleware)));

    resolve(app);
});

export const subscribeToUpdates = (app = {}) => new Promise(resolve => {
    const store = app.store;

    store.subscribe(() =>
        localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState())));

    resolve(app);
});

export const loadProfiles = (app = {}) => new Promise((resolve, reject) => {
    const store = app.store;

    const { profiles } = store.getState();
    if (profiles) resolve(app);

    fetch('/api/profiles').then(resp => {
        if (!resp.ok) return reject(new Error('Failed to load profiles.'));
        return resp.json();
    }).then(loadedProfiles => {
        store.dispatch(actions.SET_PROFILES(loadedProfiles));
        resolve(app);
    }).catch(err => {
        app.initError = err;
        reject(app);
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
        .then(registerServiceWorker)
        .then(createStore)
        .then(subscribeToUpdates)
        .then(loadProfiles)
        .then(fetchMessages)
        .then(renderApp);

import { createStore as reduxStore, applyMiddleware } from 'redux';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer, { actions } from './reducers';
import { env } from './utils/env.js';
import App from './components/App';

export const STORAGE_KEY = 'RM9000';

export const fetchMessages = (app = {}) => new Promise(resolve => {
    const tryFetch = langs => {
        if (!langs.length) {
            console.log('messages not found for your locale, falling back to english...');
            return tryFetch(['en']);
        }

        const lang = langs.pop();
        return fetch(`/messages/${lang}.json`).then(resp => {
            if (!resp.ok) return tryFetch(langs);
            return resp.json();
        });
    };

    tryFetch([...navigator.languages].reverse()).then(messages => {
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
        .then(fetchMessages)
        .then(renderApp);

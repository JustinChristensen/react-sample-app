import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from 'react-redux';
import reducer, { actions } from './reducers';
import App from './components/App';
import { env } from './utils/env.js';
import './main.css';

let middleware = [];

if (env !== 'production') {
    middleware = [...middleware, createLogger()];
}

const initialState = {};
const store = createStore(reducer, initialState, composeWithDevTools(applyMiddleware(...middleware)));

const container = document.createElement('div');
document.body.prepend(container);

render(
    <Provider store={store}>
        <App />
    </Provider>,
    container
);

if (env !== 'production') {
    const app = globalThis.app ||= {};
    app.store = store;
    app.actions = actions;
}

import { caseReducers } from '../utils/redux';
import employeesReducer from './employees.js';
import messagesReducer from './messages.js';
import profileReducer from './profile.js';

const rootReducer = caseReducers(
    employeesReducer,
    messagesReducer,
    profileReducer
);

export const actions = rootReducer.actions;
export default rootReducer;

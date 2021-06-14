import { composeReducers } from '../utils/redux';
import employeesReducer from './employees.js';
import profileReducer from './profile.js';

const rootReducer = composeReducers(
    employeesReducer,
    profileReducer
);

export const actions = rootReducer.actions;
export default rootReducer;

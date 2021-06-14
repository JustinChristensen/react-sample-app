import { composeReducers, reducer } from '../utils/redux';

export const addEmployeeReducer = reducer('ADD_EMPLOYEE', (state, employee) => {
    state.employees ||= [];
    state.employees.push(employee);
    return state;
});

export const updateEmployeeReducer = reducer('UPDATE_EMPLOYEE', (state, updatedEmployee) => {
    const employee = state.employees.find(e => e.id === updatedEmployee.id);
    Object.assign(employee, updatedEmployee);
    return state;
});

export const removeEmployeeReducer = reducer('REMOVE_EMPLOYEE', (state, id) => {
    state.employees = state.employees.filter(e => e.id === id);
    return state;
});

export default composeReducers(
    addEmployeeReducer,
    updateEmployeeReducer,
    removeEmployeeReducer
);

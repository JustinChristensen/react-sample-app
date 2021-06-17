import { composeReducers, reducer } from '../utils/redux';

export const addEmployeeReducer = reducer('ADD_EMPLOYEE', (state, employee) => {
    state.page.employees ||= [];
    employee.id = state.page.lastEmployeeId++;
    state.page.employees.push(employee);
    return state;
});

export const updateEmployeeReducer = reducer('UPDATE_EMPLOYEE', (state, updatedEmployee) => {
    const employee = state.page.employees.find(e => e.id === updatedEmployee.id);
    Object.assign(employee, updatedEmployee);
    return state;
});

export const removeEmployeeReducer = reducer('REMOVE_EMPLOYEE', (state, id) => {
    state.page.employees = state.page.employees.filter(e => e.id !== id);
    return state;
});

export default composeReducers(
    addEmployeeReducer,
    updateEmployeeReducer,
    removeEmployeeReducer
);

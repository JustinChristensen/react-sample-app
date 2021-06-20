import { caseReducers, reducer } from '../utils/redux';

export const addEmployeeReducer = reducer('ADD_EMPLOYEE', (state, employee) => {
    state.employees ||= [];
    employee.id = state.lastEmployeeId++;
    state.employees.push(employee);
});

export const updateEmployeeReducer = reducer('UPDATE_EMPLOYEE', (state, updatedEmployee) => {
    const employee = state.employees.find(e => e.id === updatedEmployee.id);
    Object.assign(employee, updatedEmployee);
});

export const removeEmployeeReducer = reducer('REMOVE_EMPLOYEE', (state, id) => {
    state.employees = state.employees.filter(e => e.id !== id);
});

export default caseReducers(
    addEmployeeReducer,
    updateEmployeeReducer,
    removeEmployeeReducer
);

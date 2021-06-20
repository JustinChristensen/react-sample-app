import { caseReducers, reducer } from '../utils/redux';

export const addEmployeeReducer = reducer('ADD_EMPLOYEE', ({ page }, employee) => {
    page.employees ||= [];
    employee.id = page.lastEmployeeId++;
    page.employees.push(employee);
});

export const updateEmployeeReducer = reducer('UPDATE_EMPLOYEE', ({ page }, updatedEmployee) => {
    const employee = page.employees.find(e => e.id === updatedEmployee.id);
    Object.assign(employee, updatedEmployee);
});

export const removeEmployeeReducer = reducer('REMOVE_EMPLOYEE', ({ page }, id) => {
    page.employees = page.employees.filter(e => e.id !== id);
});

export default caseReducers(
    addEmployeeReducer,
    updateEmployeeReducer,
    removeEmployeeReducer
);

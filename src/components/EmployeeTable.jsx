import PropTypes from 'prop-types';
import { actions } from '../reducers';
import { useT, usePropsOrState } from '../hooks';
import { EmployeeFields } from './EmployeeFields.jsx';
import { compose } from '../utils/fn.js';

export const defaultOnEmployeeDeleteClick = e => {
    e.$dispatch(actions.REMOVE_EMPLOYEE(Number(e.target.dataset.id)));
};

export const EmployeeTable = props => {
    const {
        $t,
        employees,
        onEmployeeDeleteClick
    } = compose(
        usePropsOrState(s => ({
            employees: s.page.employees,
            onEmployeeDeleteClick: defaultOnEmployeeDeleteClick
        })),
        useT
    )(props);

    return (
        <div className="row mb-4">
            <div className="col">
                <table className="table table-hover table-borderless">
                    <thead>
                        <tr>
                            <th className="px-3">{$t('employeeTable.headings.empId')}</th>
                            <th className="px-3">{$t('employeeTable.headings.firstName')}</th>
                            <th className="px-3">{$t('employeeTable.headings.lastName')}</th>
                            <th className="px-3">{$t('employeeTable.headings.email')}</th>
                            <th className="px-3">{$t('employeeTable.headings.department')}</th>
                            <th className="px-3">{$t('employeeTable.headings.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(employee =>
                            <tr key={employee.id}>
                                <EmployeeFields employee={employee} fieldTag="td" />

                                <td>
                                    <button className="btn btn-link py-0 px-2 mt-1 text-decoration-none" title={$t('employeeTable.actions.deleteTitle')}
                                        data-id={employee.id} onClick={onEmployeeDeleteClick}>
                                        {$t('employeeTable.actions.delete')}
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

EmployeeTable.propTypes = {
    $t: PropTypes.func,
    employees: PropTypes.array,
    onEmployeeDeleteClick: PropTypes.func
};


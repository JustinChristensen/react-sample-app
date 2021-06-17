import PropTypes from 'prop-types';
import { shallowEqual } from 'react-redux';
import { actions } from '../reducers';
import { usePropsOrState } from '../hooks/usePropsOrState.js';
import { lengthEq } from '../utils/eq.js';
import EmployeeFields from './EmployeeFields.jsx';
import { useT } from '../hooks/useT.js';

const EmployeeTable = _props => {
    const props = usePropsOrState(_props, (s, dispatch) => ({
        employees: s.page.employees,
        // TODO: think about how this breaks reference equality checking below
        //      or whether we even care about re-rendering if the handler function changes
        onEmployeeDeleteClick: e => {
            dispatch(actions.REMOVE_EMPLOYEE(Number(e.target.dataset.id)));
        }
    }), (nextProps, prevProps) =>
        shallowEqual(nextProps, prevProps) && lengthEq(nextProps.employees, prevProps.employees));

    const $t = useT(props);

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
                        {props.employees.map(employee =>
                            <tr key={employee.id}>
                                <EmployeeFields employee={employee} plainText fieldTag="td" />

                                <td>
                                    <button className="btn btn-link py-0 px-2 mt-1 text-decoration-none" title={$t('employeeTable.actions.deleteTitle')}
                                        data-id={employee.id} onClick={props.onEmployeeDeleteClick}>
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
    employees: PropTypes.array,
    onEmployeeDeleteClick: PropTypes.func
};

export default EmployeeTable;

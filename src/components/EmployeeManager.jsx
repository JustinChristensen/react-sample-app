import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { actions } from '../reducers';
import { usePropsOrState } from '../hooks/usePropsOrState.js';
import EmployeeTable from './EmployeeTable.jsx';
import EmployeeFields from './EmployeeFields';
import { useT } from '../hooks/useT';

export const EmployeeForm = _props => {
    const props = usePropsOrState(_props, (s, dispatch) => ({
        onEmployeeFormSubmit: e => {
            e.preventDefault();

            const form = e.target;

            dispatch(actions.ADD_EMPLOYEE({
                firstName: form.firstName.value,
                lastName: form.lastName.value,
                email: form.email.value,
                department: form.department.value
            }));

            form.reset();
        }
    }));

    const $t = useT(props);

    return (
        <form className="row mb-4" onSubmit={props.onEmployeeFormSubmit}>
            <EmployeeFields fieldClasses="col" />

            <div className="col d-flex justify-content-center">
                <button type="submit" className="btn btn-primary" title={$t('employeeForm.actions.addTitle')}>
                    <small>{$t('employeeForm.actions.add')}</small>
                </button>
            </div>
        </form>
    );
};

EmployeeForm.propTypes = {
    onEmployeeFormSubmit: PropTypes.func
};

export const EmployeeManager = () => (
    <Fragment>
        <EmployeeForm />
        <EmployeeTable />
    </Fragment>
);

export default EmployeeManager;

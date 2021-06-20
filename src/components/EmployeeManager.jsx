import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { actions } from '../reducers';
import { usePropsOrState, useT } from '../hooks';
import { EmployeeTable } from './EmployeeTable.jsx';
import { EmployeeFields } from './EmployeeFields.jsx';
import { compose } from '../utils/fn.js';

export const defaultOnEmployeeFormSubmit = e => {
    e.preventDefault();

    const form = e.target;

    e.$dispatch(actions.ADD_EMPLOYEE({
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        email: form.email.value,
        department: form.department.value
    }));

    form.reset();
    form.firstName.focus();
};

export const EmployeeForm = props => {
    const {
        $t,
        onEmployeeFormSubmit
    } = compose(
        usePropsOrState(s => ({ onEmployeeFormSubmit: defaultOnEmployeeFormSubmit })),
        useT
    )(props);

    return (
        <form className="row mb-4" onSubmit={onEmployeeFormSubmit}>
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
    $t: PropTypes.func,
    onEmployeeFormSubmit: PropTypes.func
};

export const EmployeeManager = () => (
    <Fragment>
        <EmployeeForm />
        <EmployeeTable />
    </Fragment>
);

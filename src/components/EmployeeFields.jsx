import { Fragment } from 'react';
import PropTypes from 'prop-types';
import { suffixWith } from '../utils/string.js';
import { Named, WithUid } from '../hocs';
import { usePropsOrState } from '../hooks/usePropsOrState.js';
import { actions } from '../reducers/index.js';
import { useT } from '../hooks/useT.js';

export const EmployeeFields = WithUid(Named('EmployeeFields', _props => {
    const props = usePropsOrState(_props, (s, dispatch) => ({
        employee: {},
        departments: s.page.departments,
        fieldTag: 'div',
        onEmployeeFieldChange: e => {
            const input = e.target;

            dispatch(actions.UPDATE_EMPLOYEE({
                id: props.employee.id,
                [input.name]: input.value
            }));
        },
        onEmployeeFieldBlur: e => {
            if (!e.target.reportValidity())
                e.preventDefault();
        }
    }));

    const $t = useT(props);

    const {
        $uid,
        employee,
        departments,
        fieldTag,
        fieldClasses,
        onEmployeeFieldChange,
        onEmployeeFieldBlur
    } = props;

    const [idId, fnameId, lnameId, emailId, departmentId] = suffixWith(`-${$uid}`, [
        'id',
        'first-name',
        'last-name',
        'email',
        'department'
    ]);

    const Field = fieldTag;
    const inputClasses = `px-2 form-control${employee.id ? '-plaintext' : ''}`;
    const selectClasses = `px-2 form-select ${employee.id ? 'border-0 bg-transparent' : ''}`;
    const changeHandler = employee.id && onEmployeeFieldChange;
    const blurHandler = employee.id && onEmployeeFieldBlur;

    return (
        <Fragment>
            {employee.id && (
                <Field className={fieldClasses}>
                    <label htmlFor={idId} className="visually-hidden">{$t('employeeForm.hiddenLabels.empId')}</label>
                    <input name="id" type="text" id={idId} className={inputClasses} value={employee.id} readOnly />
                </Field>
            )}

            <Field className={fieldClasses}>
                <label htmlFor={fnameId} className="visually-hidden">{$t('employeeForm.hiddenLabels.firstName')}</label>
                <input name="firstName" type="text" id={fnameId} className={inputClasses}
                    placeholder={$t('employeeForm.placeholders.firstName')} value={employee.firstName} onChange={changeHandler} onBlur={blurHandler} required />
            </Field>

            <Field className={fieldClasses}>
                <label htmlFor={lnameId} className="visually-hidden">{$t('employeeForm.hiddenLabels.lastName')}</label>
                <input name="lastName" type="text" id={lnameId} className={inputClasses}
                    placeholder={$t('employeeForm.placeholders.lastName')} value={employee.lastName} onChange={changeHandler} onBlur={blurHandler} required />
            </Field>

            <Field className={fieldClasses}>
                <label htmlFor={emailId} className="visually-hidden">{$t('employeeForm.hiddenLabels.email')}</label>
                <input name="email" type="email" id={emailId} className={inputClasses}
                    placeholder={$t('employeeForm.placeholders.email')} value={employee.email} onChange={changeHandler} onBlur={blurHandler} required />
            </Field>

            <Field className={fieldClasses}>
                <label htmlFor={departmentId} className="visually-hidden">{$t('employeeForm.hiddenLabels.department')}</label>
                <select name="department" id={departmentId} className={selectClasses} value={employee.department}
                    onBlur={blurHandler} onChange={changeHandler}>
                    {departments.map(dpt => <option key={dpt} value={dpt}>{dpt}</option>)}
                </select>
            </Field>
        </Fragment>
    );
}));

EmployeeFields.propTypes = {
    $uid: PropTypes.number,
    employee: PropTypes.object,
    departments: PropTypes.array,
    fieldTag: PropTypes.string,
    fieldClasses: PropTypes.string,
    onEmployeeFieldChange: PropTypes.func,
    onEmployeeFieldBlur: PropTypes.func
};

export default EmployeeFields;

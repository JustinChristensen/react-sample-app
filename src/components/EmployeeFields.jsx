import PropTypes from 'prop-types';
import { suffixWith } from '../utils/string.js';
import { compose } from '../utils/fn.js';
import { useUid, usePropsSelector, useT, useHandlers, useDefaults } from '../hooks';
import { actions } from '../reducers/index.js';

export const defaultOnEmployeeFieldChange = e => {
    const input = e.target;

    input.reportValidity();

    e.$dispatch(actions.UPDATE_EMPLOYEE({
        id: Number(input.dataset.empid),
        [input.name]: input.value
    }));
};

export const defaultOnEmployeeFieldBlur = e => {
    if (!e.target.reportValidity())
        e.preventDefault();
};

export const defaultOnEmployeeFieldKeyUp = e => {
    if (e.key !== 'Enter') return;

    if (!e.target.reportValidity()) e.preventDefault();
    else e.target.blur();
};

export const EmployeeFields = props => {
    const {
        $uid,
        $t,
        employee,
        departments,
        fieldTag,
        fieldClasses,
        onEmployeeFieldChange,
        onEmployeeFieldBlur,
        onEmployeeFieldKeyUp
    } = compose(
        useT,
        useUid,
        usePropsSelector(s => ({
            departments: s.departments
        })),
        useHandlers({
            onEmployeeFieldChange: defaultOnEmployeeFieldChange,
            onEmployeeFieldBlur: defaultOnEmployeeFieldBlur,
            onEmployeeFieldKeyUp: defaultOnEmployeeFieldKeyUp
        }),
        useDefaults({
            departments: [],
            employee: {},
            fieldTag: 'div',
        })
    )(props);

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
    const keyupHandler = employee.id && onEmployeeFieldKeyUp;

    return (
        <>
            {employee.id && (
                <Field className={fieldClasses}>
                    <label htmlFor={idId} className="visually-hidden">{$t('employeeForm.hiddenLabels.empId')}</label>
                    <input name="id" type="text" id={idId} className={inputClasses} value={employee.id} readOnly />
                </Field>
            )}

            <Field className={fieldClasses}>
                <label htmlFor={fnameId} className="visually-hidden">{$t('employeeForm.hiddenLabels.firstName')}</label>
                <input name="firstName" type="text" id={fnameId} className={inputClasses} placeholder={$t('employeeForm.placeholders.firstName')}
                    value={employee.firstName} onKeyUp={keyupHandler} onChange={changeHandler} onBlur={blurHandler} data-empid={employee.id} required />
            </Field>

            <Field className={fieldClasses}>
                <label htmlFor={lnameId} className="visually-hidden">{$t('employeeForm.hiddenLabels.lastName')}</label>
                <input name="lastName" type="text" id={lnameId} className={inputClasses} placeholder={$t('employeeForm.placeholders.lastName')}
                    value={employee.lastName} onKeyUp={keyupHandler} onChange={changeHandler} onBlur={blurHandler} data-empid={employee.id} required />
            </Field>

            <Field className={fieldClasses}>
                <label htmlFor={emailId} className="visually-hidden">{$t('employeeForm.hiddenLabels.email')}</label>
                <input name="email" type="email" id={emailId} className={inputClasses} placeholder={$t('employeeForm.placeholders.email')}
                    value={employee.email} onKeyUp={keyupHandler} onChange={changeHandler} onBlur={blurHandler} data-empid={employee.id} required />
            </Field>

            <Field className={fieldClasses}>
                <label htmlFor={departmentId} className="visually-hidden">{$t('employeeForm.hiddenLabels.department')}</label>
                <select name="department" id={departmentId} className={selectClasses} value={employee.department}
                    onBlur={blurHandler} onChange={changeHandler} onKeyUp={keyupHandler} data-empid={employee.id}>
                    {departments.map(dpt => <option key={dpt} value={dpt}>{dpt}</option>)}
                </select>
            </Field>
        </>
    );
};

EmployeeFields.propTypes = {
    $uid: PropTypes.number,
    $t: PropTypes.func,
    employee: PropTypes.object,
    departments: PropTypes.array,
    fieldTag: PropTypes.string,
    fieldClasses: PropTypes.string,
    onEmployeeFieldChange: PropTypes.func,
    onEmployeeFieldBlur: PropTypes.func,
    onEmployeeFieldKeyUp: PropTypes.func
};

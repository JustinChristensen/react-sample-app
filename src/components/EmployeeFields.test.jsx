import {
    defaultOnEmployeeFieldBlur,
    defaultOnEmployeeFieldChange,
    defaultOnEmployeeFieldKeyUp,
    EmployeeFields
} from './EmployeeFields.jsx';

import { actions } from '../reducers';

describe(EmployeeFields.name, () => {

    describe('without employee', () => {
        let form;

        beforeAll(() => {
            form = renderInto(<EmployeeFields />, 'form');
        });

        test('renders empty fields and no id field', () => {
            expect(form).toHaveFields('firstName', 'lastName', 'email', 'department');
            expect(form).not.toHaveField('id');
            expect(form).toHaveEmptyField('firstName');
        });

        test('rendered labels are associated with their inputs', () => {
            const labels = form.querySelectorAll('label');
            labels.forEach(label => {
                expect(label.control).toBeDefined();
            });
        });

    });

    describe('with employee', () => {
        let form;

        const departments = [
            'Deck',
            'Engine',
            'Steward'
        ];

        const bob = {
            id: 13414,
            firstName: 'Bobby',
            lastName: 'Brooks',
            email: 'bobby.brooks@corp.com',
            department: departments[1]
        };

        beforeAll(() => {
            form = renderInto(
                <EmployeeFields
                    employee={bob}
                    departments={departments}
                    fieldTag="section"
                    fieldClasses="foo bar" />,
                'form');
        });

        const fieldVal = (form, field) => form.elements[field].value;

        test('renders employee data in fields', () => {
            Object.keys(bob).forEach(field => {
                expect(fieldVal(form, field)).toBe(String(bob[field]));
            });
        });

        test('renders the list of departments in a select', () => {
            const select = form.querySelector('select');
            expect(select).toBeDefined();
            expect(select.options.length).toBe(departments.length);
        });

        test('the employee id field is present and read only', () => {
            expect(form.elements.id.readOnly).toBe(true);
        });

        test('it allows the field wrapper element type and classes to be specified', () => {
            const sections = form.querySelectorAll('section');
            expect(sections.length).toBe(Object.keys(bob).length);
            expect(sections[0].className).toBe('foo bar');
        });

    });

});

describe(defaultOnEmployeeFieldChange.name, () => {

    test('dispatches UPDATE_EMPLOYEE', () => {
        const e = makeContextEvent('change', {
            target: createEl('input')
        });

        e.employee = { id: 3 };
        defaultOnEmployeeFieldChange(e);

        expect(e).toHaveDispatched({ type: String(actions.UPDATE_EMPLOYEE) });
    });

});

describe(defaultOnEmployeeFieldBlur.name, () => {

    test('prevents default if the input is not valid', () => {
        const input = createEl('input');
        const e = makeContextEvent('blur', { target: input });

        input.required = true;
        defaultOnEmployeeFieldBlur(e);

        input.required = false;
        defaultOnEmployeeFieldBlur(e);

        expect(e.preventDefault).toHaveBeenCalledTimes(1);
    });

});

describe(defaultOnEmployeeFieldKeyUp.name, () => {

    test('prevents default if the input is not valid, on enter', () => {
        const input = createEl('input');
        const e = makeContextEvent('keyup', { target: input, key: 'Enter' }, KeyboardEvent);

        input.required = true;
        defaultOnEmployeeFieldKeyUp(e);

        input.required = false;
        defaultOnEmployeeFieldKeyUp(e);

        expect(e.preventDefault).toHaveBeenCalledTimes(1);
    });

    test('returns otherwise', () => {
        const input = createEl('input');
        const e = makeContextEvent('keyup', { target: input, key: 'ArrowRight' }, KeyboardEvent);
        defaultOnEmployeeFieldKeyUp(e);
        expect(e.preventDefault).not.toHaveBeenCalled();
    });

});

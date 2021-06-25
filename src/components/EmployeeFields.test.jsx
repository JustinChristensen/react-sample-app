import { EmployeeFields } from './EmployeeFields.jsx';

describe(EmployeeFields.name, () => {

    describe('without employee', () => {
        let form;

        beforeAll(() => { form = renderInto(<EmployeeFields />, 'form'); });

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

import { EmployeeFields } from './EmployeeFields.jsx';
import { renderIntoDocument } from 'react-dom/test-utils'

describe(EmployeeFields.name, () => {

    describe('without employee', () => {

        let doc;

        beforeAll(() => {
            doc = renderIntoDocument(
                <EmployeeFields />
            );
        });

        test('renders empty fields and no id field', () => {
            const inputs = doc.querySelectorAll('input'),
                select = doc.querySelector('select');
            expect(inputs.length).toBe(3);
            expect(select).not.toBeNull();
        });

    });

    // describe('with employee', () => {

    //     test('renders employee data in fields', () => {
    //     });

    //     test('renders the list of departments in a select', () => {
    //     });

    //     test('the employee id field is present and read only', () => {
    //     });

    //     test('it allows the field wrapper element type and classes to be specified', () => {
    //     });

    // });

});

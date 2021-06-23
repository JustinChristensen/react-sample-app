import { EmployeeFields } from './EmployeeFields.jsx';
import { identity } from '../utils/fn.js';
import { render } from 'react-dom';

const renderIntoDiv = elem => {
    const div = document.createElement('div');
    render(elem, div);
    return div;
};

describe(EmployeeFields.name, () => {

    describe('without employee', () => {

        let container;

        beforeAll(() => {
            container = renderIntoDiv(
                <EmployeeFields $t={identity} />
            );
        });

        test('renders empty fields and no id field', () => {
            const inputs = container.querySelectorAll('input'),
                select = container.querySelector('select');
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

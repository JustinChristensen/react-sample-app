import { defaultOnDropdownMenuKeyUp, HeaderMenu } from './AppHeader';
import { actions } from '../reducers';

const items = [
    'foo',
    'bar',
    'baz'
];

const selectedItem = 'bar';

describe(HeaderMenu.name, () => {

    let div;

    beforeAll(() => {
        div = renderInto(<HeaderMenu items={items} selectedItem={selectedItem} />);
    });

    test('renders items', () => {
        const listItems = div.querySelectorAll('li');
        expect(listItems.length).toBe(items.length - 1);
    });

    test('does not render the selected item in the dropdown menu', () => {
        const listItems = div.querySelectorAll('li');
        expect(listItems).not.toHaveText(selectedItem);
    });

});

describe(defaultOnDropdownMenuKeyUp.name, () => {

    let div;

    beforeAll(() => {
        div = renderInto(<HeaderMenu items={items} selectedItem={selectedItem} />);
    });

    test('focuses next button on down arrow', () => {
        const buttons = div.querySelectorAll('.dropdown-menu button');
        const e = makeContextEvent('keyup', {
            target: buttons[0],
            key: 'ArrowDown'
        }, KeyboardEvent);

        buttons[0].focus = jest.fn();
        buttons[1].focus = jest.fn();

        defaultOnDropdownMenuKeyUp(e);
        expect(buttons[0].focus).not.toHaveBeenCalled();
        expect(buttons[1].focus).toHaveBeenCalled();

        buttons[1].focus.mockClear();
        e.key = 'ArrowUp';
        e.target = buttons[1];
        defaultOnDropdownMenuKeyUp(e);
        expect(buttons[0].focus).toHaveBeenCalled();
        expect(buttons[1].focus).not.toHaveBeenCalled();

    });

});

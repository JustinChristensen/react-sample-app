import { AppHeader, HeaderMenu } from './AppHeader.jsx';

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

describe(AppHeader.name, () => {

    test.todo('renders two menus');

});

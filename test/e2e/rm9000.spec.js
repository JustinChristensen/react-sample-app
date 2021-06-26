const { state, actions, action, start, launch } = require('./runner.js');
const expect = require('expect');

const nodeValue = elem => elem.evaluate(node => node.value);

const home = state(async ({ page, context }) => {
    const logoText = await page.innerText('.logotype');
    const firstName = await page.$('.employee-form [name="firstName"]');
    expect(logoText).toBe('Resource Manager 9000');
    expect(await nodeValue(firstName)).toBe('');
    // TODO: note down how many employees are currently in the form, for the employeeAdded assertion
});

const addEmployeeFormFilled = state(async ({ page }) => {
    const form = await page.$('.employee-form');
    const firstName = await form.$('[name="firstName"]'),
        email = await form.$('[name="email"]');

    expect(await nodeValue(firstName)).not.toBe('');
    expect(await nodeValue(email)).not.toBe('');
});

const localeMenuOpen = state(async ({ page }) => {
    const menu = page.$('.locale-menu .dropdown-menu');
    expect(await menu.isVisible()).toBeTruthy();
});

actions(
    action('fillAddEmployeeForm', addEmployeeFormFilled, async ({ page }) => {
        await page.fill('.employee-form [name="firstName"]', 'Foo');
        await page.fill('.employee-form [name="lastName"]', 'Bar');
        await page.fill('.employee-form [name="email"]', 'foo.bar@corp.com');
        await page.selectOption('.employee-form [name="department"]', 'Maintenance');
        await page.focus('.add-employee-button');
    }),

    action('clickLocaleMenu', localeMenuOpen, async ({ page }) =>
        await page.click('.locale-menu button'))
)(home);

actions(
    action('goHome', home, ({ page }) => page.goto('http://localhost:3000'))
)(start);

(async () => {

    launch(start, { headless: false }, async ({ run }) => {
        await run('goHome', 'fillAddEmployeeForm', 'submitAddEmployeeForm');
    });

})();

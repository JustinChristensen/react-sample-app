const { state, actions, start, launch } = require('./runner.js');
const expect = require('expect');

const nodeValue = elem => elem.evaluate(node => node.value);

const home = state(async ({ page, context }) => {
    const logoText = await page.innerText('.logotype');
    const firstName = await page.$('.employee-form [name="firstName"]');
    const employeeRows = await page.$$('.employee-table tbody tr');
    expect(logoText).toBe('Resource Manager 9000');
    expect(await nodeValue(firstName)).toBe('');
    context.employeeCount = employeeRows.length;
});

const addEmployeeFormFilled = state(async ({ page }) => {
    const form = await page.$('.employee-form');
    const fields = await form.$$('input');

    for (const field of fields)
        expect(await nodeValue(field)).not.toBe('');
});

const localeMenuOpen = state(async ({ page }) => {
    const menu = page.$('.locale-menu .dropdown-menu');
    expect(await menu.isVisible()).toBeTruthy();
});

const employeeAdded = state(async ({ page, context }) => {
    const employeeRows = await page.$$('.employee-table tbody tr');
    expect(context.employeeCount).toBeLessThan(employeeRows.length);
});

actions(home,

    ['fillAddEmployeeForm', addEmployeeFormFilled, async ({ page }) => {
        await page.fill('.employee-form [name="firstName"]', 'Foo');
        await page.fill('.employee-form [name="lastName"]', 'Bar');
        await page.fill('.employee-form [name="email"]', 'foo.bar@corp.com');
        await page.selectOption('.employee-form [name="department"]', 'Maintenance');
        await page.focus('.add-employee-button');
    }],

    ['clickLocaleMenu', localeMenuOpen, async ({ page }) =>
        await page.click('.locale-menu button')
    ]
);

actions(addEmployeeFormFilled,

    ['submitAddEmployeeForm', employeeAdded, async ({ page }) => {
        const submitBtn = await page.$('.add-employee-button');
        await submitBtn.click();
    }]

);

actions(employeeAdded, [home]);

actions(start,

    ['goHome', home, ({ page }) =>
        page.goto('http://localhost:3000')
    ]

);

launch(start, { headless: false }, async ({ run }) => {
    await run('goHome', 'fillAddEmployeeForm', 'submitAddEmployeeForm');
});

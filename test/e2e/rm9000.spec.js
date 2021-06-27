const { state, actions, start, launch } = require('./runner.js');
const expect = require('expect');

const getValue = elem => elem.evaluate(node => node.value);

const home = state(async ({ page, context }) => {
    const logoText = await page.innerText('.logotype'),
        firstName = await page.$('.employee-form [name="firstName"]'),
        employeeRows = await page.$$('.employee-table tbody tr'),
        menus = await page.$$('.header-menu .dropdown-menu'),
        localeToggle = await page.$('.locale-menu button');

    for (const menu of menus)
        expect(await menu.isVisible()).not.toBeTruthy();

    expect(logoText).not.toBe('');
    expect(await getValue(firstName)).toBe('');
    context.employeeCount = employeeRows.length;
    context.selectedLocale = await localeToggle.getAttribute('data-id');
});

const addEmployeeFormFilled = state(async ({ page }) => {
    const form = await page.$('.employee-form');
    const fields = await form.$$('input');

    for (const field of fields)
        expect(await getValue(field)).not.toBe('');
});

const localeMenuOpen = state(async ({ page }) => {
    const localeMenu = await page.$('.locale-menu'),
        toggleButton = await localeMenu.$('.dropdown-toggle'),
        menu = await localeMenu.$('.dropdown-menu'),
        menuButtons = await menu.$$('button');

    const selectedLocale = await toggleButton.getAttribute('data-id');
    const menuLocales = await Promise.all(menuButtons.map(button => button.getAttribute('data-id')));

    expect(await menu.isVisible()).toBeTruthy();
    expect(menuLocales).not.toContain(selectedLocale);
});

const localeChanged = state(async ({ page, context }) => {
    const localeToggle = await page.$('.locale-menu .dropdown-toggle');
    expect(context.locale).not.toBe(await localeToggle.getAttribute('data-id'));
});

const employeeAdded = state(async ({ page, context }) => {
    const employeeRows = await page.$$('.employee-table tbody tr');
    expect(employeeRows.length).toBeGreaterThan(context.employeeCount);
    context.employeeCount = employeeRows.length;
});

const employeeChanged = state(async ({ page, context }) => {
    const departments = await page.$('.employee-table tbody tr select[name="department"]');
    expect(await getValue(departments)).not.toBe(context.employee.department);
});

const employeeDeleted = state(async ({ page, context }) => {
    const employeeRows = await page.$$('.employee-table tbody tr');
    expect(employeeRows.length).toBeLessThan(context.employeeCount);
    context.employeeCount = employeeRows.length;
});

actions(home,

    ['fillAddEmployeeForm', addEmployeeFormFilled, async ({ page }) => {
        await page.fill('.employee-form [name="firstName"]', 'Gone');
        await page.fill('.employee-form [name="lastName"]', 'Johnson');
        await page.fill('.employee-form [name="email"]', 'gone.johnson@corp.com');
        await page.selectOption('.employee-form [name="department"]', 'Maintenance');
        await page.focus('.add-employee-button');
    }],

    ['clickLocaleMenu', localeMenuOpen, async ({ page }) =>
        await page.click('.locale-menu .dropdown-toggle')
    ]

);

actions(addEmployeeFormFilled,

    ['submitAddEmployeeForm', employeeAdded, async ({ page }) => {
        const submitBtn = await page.$('.add-employee-button');
        await submitBtn.click();
    }]

);

const deleteEmployee = ['deleteEmployee', employeeDeleted, async ({ page }) => {
    await page.click('.employee-table .delete-employee-button');
}];

actions(employeeAdded,

    ['changeEmployeeDepartment', employeeChanged, async ({ page, context }) => {
        const departments = await page.$('.employee-table tbody tr select');

        context.employee ||= {};
        context.employee.department = await getValue(departments);

        await departments.selectOption('Human Resources');
    }],

    deleteEmployee

);

actions(employeeChanged, deleteEmployee);
actions(employeeDeleted, [home]);

actions(localeMenuOpen,

    ['clickFrance', localeChanged, async ({ page }) => {
        const frButton = await page.$('.locale-menu .dropdown-menu button[data-id="fr"]');
        await frButton.click();
    }]

);

actions(localeChanged, [home]);

actions(start,

    ['goHome', home, ({ page }) =>
        page.goto('http://localhost:3000')
    ]

);

launch(start, { headless: false }, async ({ run }) => {
    await run([
        'goHome',
        'fillAddEmployeeForm',
        'submitAddEmployeeForm',
        'changeEmployeeDepartment',
        'deleteEmployee',
        'clickLocaleMenu',
        'clickFrance'
    ]);
});

const { state, actions, start, launch } = require('./runner.js');
const expect = require('expect');

const getValue = elem => elem.evaluate(node => node.value);

const home = state(async ({ page, context }) => {
    const logoText = await page.innerText('.logotype'),
        firstName = await page.$('.employee-form [name="firstName"]'),
        employeeRows = await page.$$('.employee-table tbody tr'),
        menus = await page.$$('.header-menu .dropdown-menu'),
        localeToggle = await page.$('.locale-menu .dropdown-toggle'),
        profileToggle = await page.$('.profile-menu .dropdown-toggle');

    for (const menu of menus)
        expect(await menu.isVisible()).not.toBeTruthy();

    expect(logoText).not.toBe('');
    expect(await getValue(firstName)).toBe('');
    context.employeeCount = employeeRows.length;
    context.locale = await localeToggle.getAttribute('data-id');
    context.profile = await profileToggle.getAttribute('data-id');
});

const addEmployeeFormFilled = state(async ({ page }) => {
    const form = await page.$('.employee-form');
    const fields = await form.$$('input');

    for (const field of fields)
        expect(await getValue(field)).not.toBe('');
});

const expectMenuOpen = async (menuSelector, { page }) => {
    const headerMenu = await page.$(menuSelector),
        toggleButton = await headerMenu.$('.dropdown-toggle'),
        menu = await headerMenu.$('.dropdown-menu'),
        menuButtons = await menu.$$('button');

    const selectedItem = await toggleButton.getAttribute('data-id');
    const menuItems = await Promise.all(menuButtons.map(button => button.getAttribute('data-id')));

    expect(await menu.isVisible()).toBeTruthy();
    expect(menuItems).not.toContain(selectedItem);
};

const localeMenuOpen = state(async fixtures => expectMenuOpen('.locale-menu', fixtures));
const profileMenuOpen = state(async fixtures => expectMenuOpen('.profile-menu', fixtures));

const localeChanged = state(async ({ page, context }) => {
    const localeToggle = await page.$('.locale-menu .dropdown-toggle');
    const toggleId = await localeToggle.getAttribute('data-id');
    console.log(context.locale, toggleId);
    expect(context.locale).not.toBe(toggleId);
    context.locale = toggleId;
});

const profileChanged = state(async ({ page, context }) => {
    const profileToggle = await page.$('.profile-menu .dropdown-toggle');
    expect(context.profile).not.toBe('');
    const toggleId = await profileToggle.getAttribute('data-id');
    console.log(context.profile, toggleId);
    expect(context.profile).not.toBe(toggleId);
    context.profile = toggleId;
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
    ],

    ['clickProfileMenu', profileMenuOpen, async ({ page }) =>
        await page.click('.profile-menu .dropdown-toggle')
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

actions(profileMenuOpen,

    ['clickRon', profileChanged, async ({ page }) => {
        const profileButton = await page.$('.profile-menu .dropdown-menu button[data-id="2"]');
        await profileButton.click();
    }]

);

actions(localeChanged, [home]);

actions(start,

    ['goHome', home, ({ page }) =>
        page.goto('http://localhost:3000')
    ]

);

launch(start, { headless: false }, async ({ run, runAll }) => {
    await runAll(
        run(['goHome', 'fillAddEmployeeForm', 'submitAddEmployeeForm', 'changeEmployeeDepartment', 'deleteEmployee']),
        run(['goHome', 'clickLocaleMenu', 'clickFrance']),
        run(['goHome', 'clickProfileMenu', 'clickRon'])
    );
});

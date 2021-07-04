const { state, actions, start, launch } = require('./runner.js');
const expect = require('expect');

const getValue = handle => handle.evaluate(node => node.value);
const hasFocus = handle => handle.evaluate(node => node === document.activeElement);
const isValid = handle => handle.evaluate(node => node.checkValidity());

const home = state(async ({ page, context }) => {
    const body = await page.$('body'),
        logoText = await page.innerText('.logotype'),
        firstName = await page.$('.employee-form [name="firstName"]'),
        employeeRows = await page.$$('.employee-table tbody tr'),
        menus = await page.$$('.header-menu .dropdown-menu'),
        localeToggle = await page.$('.locale-menu .dropdown-toggle'),
        profileToggle = await page.$('.profile-menu .dropdown-toggle');

    for (const menu of menus)
        expect(await menu.isVisible()).not.toBeTruthy();

    expect(await hasFocus(body)).toBe(true);
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

const localeMenuOpen = state(fixtures => expectMenuOpen('.locale-menu', fixtures));
const profileMenuOpen = state(fixtures => expectMenuOpen('.profile-menu', fixtures));

const localeChanged = state(async ({ page, context }) => {
    const localeToggle = await page.$('.locale-menu .dropdown-toggle');
    const toggleId = await localeToggle.getAttribute('data-id');
    expect(context.locale).not.toBe(toggleId);
    context.locale = toggleId;
});

const profileSelected = state(async ({ page, context }) => {
    const menuButtons = await page.$$('.profile-menu .dropdown-menu button');
    const focusedIndex = await page.evaluate(buttons =>
        buttons.findIndex(b => b === document.activeElement), menuButtons);

    if (context.direction === 'down') {
        expect(focusedIndex).toBe(context.focusedMenuButton + 1);
        context.focusedMenuButton++;
    } else if (context.direction === 'up') {
        expect(focusedIndex).toBe(context.focusedMenuButton - 1);
        context.focusedMenuButton--;
    }
});

const profileChanged = state(async ({ page, context }) => {
    const profileToggle = await page.$('.profile-menu .dropdown-toggle');
    expect(context.profile).not.toBe('');
    const toggleId = await profileToggle.getAttribute('data-id');
    expect(context.profile).not.toBe(toggleId);
    context.profile = toggleId;
});

const employeeAdded = state(async ({ page, context }) => {
    const employeeRows = await page.$$('.employee-table tbody tr');
    expect(employeeRows.length).toBe(context.employeeCount + 1);
    context.employeeCount = employeeRows.length;
});

const employeeChanged = state(async ({ page, context }) => {
    const departments = await page.$('.employee-table tbody tr select[name="department"]');
    expect(await getValue(departments)).not.toBe(context.employee.department);
});

const employeeDeleted = state(async ({ page, context }) => {
    const employeeRows = await page.$$('.employee-table tbody tr');
    expect(employeeRows.length).toBe(context.employeeCount - 1);
    context.employeeCount = employeeRows.length;
});

const tableEmailFieldInvalid = state(async ({ page }) => {
    const emailField = await page.$('.employee-table tbody tr [name="email"]');
    expect(await isValid(emailField)).toBe(false);
    expect(await hasFocus(emailField)).toBe(true);
});

const tableEmailFieldValid = state(async ({ page }) => {
    const emailField = await page.$('.employee-table tbody tr [name="email"]');
    expect(await isValid(emailField)).toBe(true);
    expect(await hasFocus(emailField)).toBe(true);
});

const submitAddEmployeeForm = async ({ page }) => {
    const submitBtn = await page.$('.add-employee-button');
    await submitBtn.click();
};

const fillAddEmployeeForm = async ({ page }) => {
    await page.fill('.employee-form [name="firstName"]', 'Gone');
    await page.fill('.employee-form [name="lastName"]', 'Johnson');
    await page.fill('.employee-form [name="email"]', 'gone.johnson@corp.com');
    await page.selectOption('.employee-form [name="department"]', 'Maintenance');
    await page.focus('.add-employee-button');
};

actions(home,

    [fillAddEmployeeForm, addEmployeeFormFilled],

    ['addEmployee', employeeAdded, async fixtures => {
        await fillAddEmployeeForm(fixtures);
        await submitAddEmployeeForm(fixtures);
    }],

    ['clickLocaleMenu', localeMenuOpen, async ({ page }) =>
        await page.click('.locale-menu .dropdown-toggle')
    ],

    ['clickProfileMenu', profileMenuOpen, async ({ page }) =>
        await page.click('.profile-menu .dropdown-toggle')
    ]

);

actions(addEmployeeFormFilled,

    [submitAddEmployeeForm, employeeAdded]

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

    ['clearEmployeeEmail', tableEmailFieldInvalid, async ({ page }) => {
        await page.fill('.employee-table tbody tr [name="email"]', '');
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
    }],

    ['pressTabAndDownArrow', profileSelected, async ({ page, context }) => {
        await page.keyboard.press('Tab');
        await page.keyboard.press('ArrowDown');
        context.focusedMenuButton = 0;
        context.direction = 'down';
    }]

);

actions(localeChanged, [home]);
actions(profileChanged, [home]);
actions(profileSelected,

    ['pressUpArrow', profileSelected, async ({ page, context }) => {
        await page.keyboard.press('ArrowUp');
        context.direction = 'up';
    }]

);

const hitEnter = async ({ page }) => {
    await page.keyboard.press('Enter');
};

actions(tableEmailFieldInvalid,

    ['tryFocusSomethingElse', tableEmailFieldInvalid, async ({ page }) => {
        await page.keyboard.press('Tab');
    }] ,

    [hitEnter, tableEmailFieldInvalid],

    ['changeEmployeeEmail', tableEmailFieldValid, async ({ page }) => {
        await page.fill('.employee-table tbody tr [name="email"]', 'gone.johnson@runs.com');
    }]

);

actions(tableEmailFieldValid,

    [hitEnter, home]

);

actions(start,

    ['goHome', home, ({ page }) =>
        page.goto('http://localhost:3000')
    ]

);

launch({ headless: false }, async ({ run, runAll }) => {
    await runAll(
        run('goHome', 'fillAddEmployeeForm', 'submitAddEmployeeForm', 'changeEmployeeDepartment', 'deleteEmployee'),
        run('goHome', 'clickLocaleMenu', 'clickFrance'),
        run('goHome', 'clickProfileMenu', 'clickRon', 'clickProfileMenu', 'pressTabAndDownArrow', 'pressUpArrow'),
        run('goHome', 'addEmployee', 'clearEmployeeEmail', 'tryFocusSomethingElse', 'hitEnter', 'changeEmployeeEmail', 'hitEnter')
    );
});

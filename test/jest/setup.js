import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';

const defineProp = (o, k, v, conf) => Object.defineProperty(o, k, { ...conf, value: v });

globalThis.renderInto = (elem, cont = 'div') => {
    cont = document.createElement(cont);
    act(() => { render(elem, cont); });
    return cont;
};

globalThis.makeContextEvent = (type, eventProps = {}, EventConstr = Event) => {
    const e = new EventConstr(type);

    Object.keys(eventProps).forEach(k => defineProp(e, k, eventProps[k], { writable: true }));

    defineProp(e, '$context', { value: {} });

    [   '$getState',
        '$dispatch',
        'preventDefault',
        'stopPropagation',
        'stopImmediatePropagation',
    ].forEach(k => defineProp(e, k, jest.fn()));

    return e;
};

globalThis.createEl = (el, attrs = {}) => Object.keys(attrs).reduce((el, attr) =>
    (el.setAttribute(attr, attrs[attr]), el), document.createElement(el));

const formMissing = form => ({ pass: false, message: () => `form is ${form}` });
const hasField = (form, field) => !!form.elements[field];
const fieldNotFound = field => `expected form to have field ${field}, but no such field exists`;
const _not = (flag, isNot, is = '') => {
    const runNot = (isNot, is = '') => flag ? isNot : is;
    return isNot === undefined ? runNot : runNot(isNot, is);
};

// https://github.com/jsdom/jsdom/issues/1570
expect.extend({
    toHaveFields(form, ...fields) {
        if (!form) return formMissing(form);

        fields = fields.flat();
        const foundFields = fields.filter(f => form.elements[f]);

        return {
            pass: foundFields.length === fields.length,
            message: () => `expected form to have fields ${fields.join(', ')}, but ` +
                (foundFields.length ? `only found fields ${foundFields.join(', ')}` : 'all fields were missing')
        };
    },
    toHaveField: (form, field) => {
        if (!form) return formMissing(form);

        return {
            pass: !!form.elements[field],
            message: () => fieldNotFound(field)
        };
    },
    toHaveEmptyField(form, field) {
        if (!form) return formMissing(form);

        const found = hasField(form, field);
        const fieldVal = form.elements[field].value;
        const empty = fieldVal === '';

        return {
            pass: found && empty,
            message: () => {
                if (!found) return fieldNotFound(field);
                return `expected field ${field} to be empty, but saw value ${fieldVal}`;
            }
        };
    },
    toHaveDispatched(e, action) {
        if (!e) return { pass: false, message: () => `expected an event, got ${e}` };
        const { subsetEquality, printExpected, printReceived } = this.utils;
        const { calls } = e.$dispatch.mock;
        const not = _not(this.isNot);

        const called = calls.length > 0;
        const calledWith = called && calls.some(([ arg ]) => subsetEquality(arg, action));

        return {
            pass: called && calledWith,
            message: () => {
                if (!called) return `expected $dispatch ${not('not ')}to have been called, but it ${not('was', 'was not')}`;
                if (!calledWith) {
                    const received = calls.map(([arg]) => printReceived(arg)).join('\n');
                    return `expected $dispatch ${not(' not')}to have been called with ${printExpected(action)}, but it was called with\n${received}`;
                }
            }
        };
    },
    toHaveText(elems, text) {
        const { printExpected, printReceived } = this.utils;
        if (!elems) return { pass: false, message: () => `expected element(s), got ${printReceived(elems)}` };
        const not = _not(this.isNot);
        if (!elems.forEach) elems = [elems];
        const elemsText = Array.from(elems).map(el => el.textContent);
        const textRe = new RegExp(text);

        return { pass: elemsText.some(t => textRe.test(t)), message: () =>
            `expected element(s) ${not('not ')}to have text ${printExpected(text)}, but ` +
            `${printReceived(elemsText)} ${not('matched', 'did not match')}` };
    }
});

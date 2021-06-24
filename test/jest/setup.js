import { render } from 'react-dom';
import { act } from 'react-dom/test-utils';

const defineProp = (o, k, v) => Object.defineProperty(o, k, { value: v});

globalThis.renderInto = (elem, cont = 'div') => {
    cont = document.createElement(cont);
    act(() => { render(elem, cont); });
    return cont;
};

globalThis.makeContextEvent = (type, eventProps = {}, EventConstr = Event) => {
    const e = new EventConstr(type);

    Object.keys(eventProps).forEach(k => defineProp(e, k, eventProps[k]));

    defineProp(e, '$context', { value: {} });

    [   '$getState',
        '$dispatch',
        'preventDefault',
        'stopPropagation',
        'stopImmediatePropagation',
    ].forEach(k => defineProp(e, k, jest.fn()));

    return e;
};

globalThis.createEl = document.createElement.bind(document);

const formMissing = form => ({ pass: false, message: () => `form is ${form}` });
const hasField = (form, field) => !!form.elements[field];
const fieldNotFound = field => `expected form to have field ${field}, but no such field exists`;

// https://github.com/jsdom/jsdom/issues/1570
expect.extend({
    toHaveFields: (form, ...fields) => {
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
    toHaveEmptyField: (form, field) => {
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
    toHaveDispatched: (e, action) => {
        if (!e) return { pass: false, message: () => `expected an event, got ${e}` };
        // TODO: this has a confusing stack trace on error. Jest apparently doesn't support matchers made from matchers
        expect(e.$dispatch).toHaveBeenCalledWith(expect.objectContaining(action));
        return { pass: true, matcher: () => {} };
    }
});

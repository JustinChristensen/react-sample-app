import IntlMessageFormat from 'intl-messageformat';
import { useSelector } from 'react-redux';
import { get } from '../utils/object.js';
import { isObject } from '../utils/eq.js';

// boooooo
class NotMessageError extends Error {
    constructor(key) {
        super(`Key '${key}' found an object, and not a message. Are you sure it's correct?`);
        this.name = 'NotMessageError';
    }
}

// double boooooo
class MessageNotFoundError extends Error {
    constructor(key) {
        super(`Message not found for key '${key}', and no default message was provided.`);
        this.name = 'MessageNotFoundError';
    }
}

let messageAstCache = {};

export const useT = userProps => {
    const doHook = props => {
        let messages;

        // for reference equality checking below
        const defaultT = (key, values, defaultMsg) => {
            const lang = navigator.languages[0];
            let msg;

            // figure out our msg situation
            if (messageAstCache[key]) msg = new IntlMessageFormat(messageAstCache[key], lang);
            else {
                const maybeMsg = get(messages, key, defaultMsg);

                if (isObject(maybeMsg))
                    throw new NotMessageError(key);
                else if (!maybeMsg)
                    throw new MessageNotFoundError(key);

                msg = new IntlMessageFormat(maybeMsg, lang);
                messageAstCache[key] = msg.getAst();
            }

            return msg.format(values);
        };

        const [, nextProps] = useSelector(s => {
            messages = s.messages;
            return [
                messages,
                { $t: defaultT, ...props }
            ];
        }, ([nextMessages, nextProps], [prevMessages, prevProps]) => {
            // compare the old messages to the new messages, and
            // the old $t to the new $t (in case of prop override)
            if (!Object.is(nextMessages, prevMessages) ||
                !Object.is(nextProps.$t, prevProps.$t)) {
                messageAstCache = {};
                return false;
            }

            return true;
        });

        return Object.freeze(nextProps);
    };

    // curried for composition
    return userProps ? doHook(userProps) : doHook;
};

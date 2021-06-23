import IntlMessageFormat from 'intl-messageformat';
import { useSelector } from './useSelector.js';
import { get } from '../utils/object.js';
import { isObject } from '../utils/eq.js';
import { useRef } from 'react';

class NotMessageError extends Error {
    constructor(key) {
        super(`Key '${key}' found an object, and not a message. Are you sure it's correct?`);
        this.name = 'NotMessageError';
    }
}

class MessageNotFoundError extends Error {
    constructor(key) {
        super(`Message not found for key '${key}', and no default message was provided.`);
        this.name = 'MessageNotFoundError';
    }
}

let messageAstCache = {};

export const useT = userProps => {
    const doHook = props => {
        const lastMessages = useRef();

        // force re-rendering when the messages change
        useSelector(s => {
            const messages = s.messages[s.selectedLang];

            if (lastMessages.current !== messages)
                messageAstCache = {};

            return lastMessages.current = messages;
        });

        // for reference equality checking below
        const defaultT = (key, values, defaultMsg) => {
            const lang = navigator.languages[0];
            let msg;

            // figure out our msg situation
            if (messageAstCache[key]) msg = new IntlMessageFormat(messageAstCache[key], lang);
            else {
                const maybeMsg = get(lastMessages.current, key, defaultMsg);

                if (isObject(maybeMsg))
                    throw new NotMessageError(key);
                else if (!maybeMsg)
                    throw new MessageNotFoundError(key);

                msg = new IntlMessageFormat(maybeMsg, lang);
                messageAstCache[key] = msg.getAst();
            }

            return msg.format(values);
        };

        return Object.freeze({ $t: defaultT, ...props });
    };

    // curried for composition
    return userProps ? doHook(userProps) : doHook;
};

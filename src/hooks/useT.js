import IntlMessageFormat from 'intl-messageformat';
import { shallowEqual, useSelector } from 'react-redux';
import { get } from '../utils/object.js';

// boooooo
class NotMessageError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotMessageError';
    }
}

class MessageNotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MessageNotFoundError';
    }
}

const makeUseT = () => {
    let messageAsts = {};

    const useT = props => {
        let messages;

        // for reference equality checking
        const defaultT = (key, values, defaultMsg) => {
            const lang = navigator.languages[0];
            let msg;

            if (messageAsts[key]) msg = new IntlMessageFormat(messageAsts[key], lang);
            else {
                const maybeMsg = get(messages, key, defaultMsg);

                if (typeof maybeMsg === 'object')
                    throw new NotMessageError(`Key '${key}' found an object, and not a message. Are you sure it's correct?`);
                else if (!maybeMsg)
                    throw new MessageNotFoundError(`Message not found for key '${key}', and no default message was provided.`);

                msg = new IntlMessageFormat(maybeMsg, lang);
                messageAsts[key] = msg.getAst();
            }

            return msg.format(values);
        };

        const { $t } = useSelector(s => {
            messages = s.messages;
            return {
                messages,
                $t: props.$t || defaultT
            };
        }, (nextT, prevT) => {
            if (!shallowEqual(nextT, prevT)) {
                messageAsts = {};
                return false;
            }

            return true;
        });

        return $t;
    };

    return useT;
};

export const useT = makeUseT();

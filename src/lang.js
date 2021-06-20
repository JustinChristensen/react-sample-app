import { actions } from './reducers';
import { invert } from './utils/object.js';
import { sitePath } from './utils/env.js';

// yeah, yeah, but this is a demo after all
const localeLangMap = {
    us: 'en',
    fr: 'fr'
};

const langLocaleMap = invert(localeLangMap);

export const localeToLang = loc => localeLangMap[loc];
export const langToLocale = lang => langLocaleMap[lang];
export const availableLocales = Object.keys(localeLangMap);

export const detectBrowserLocale = () => {
    return langToLocale(navigator.languages.find(navLang =>
        availableLocales.includes(langToLocale(navLang)))) || availableLocales[0];
};

export const setLocale = (getState, dispatch, locale) => new Promise((resolve, reject) => {
    let state = getState();

    if (!locale && !state.selectedProfile.locale) locale = detectBrowserLocale();
    if (locale) dispatch(actions.SET_LOCALE(locale));

    const { messages } = state = getState();

    const profileLang = localeToLang(state.selectedProfile.locale);

    if (!messages || !messages[profileLang]) {
        fetch(`${sitePath}/messages/${profileLang}.json`).then(resp => {
            if (!resp.ok)
                return reject(new Error(`Failed to load messages for lang ${profileLang}`));

            return resp.json();
        }).then(messages => {
            dispatch(actions.SET_MESSAGES({ lang: profileLang, messages}));
            resolve();
        });
    } else resolve();
});

import { localeToLang } from '../lang.js';
import { reducer } from '../utils/redux';

export const setMessagesReducer = reducer('SET_MESSAGES', (state, { lang, messages }) => {
    state.messages ||= {};
    state.messages[lang] = messages;

    // we're loading messages, and the currently selected language may not yet match
    // the profile's selected language
    const profileLang = localeToLang(state.selectedProfile.locale);
    if (state.selectedLang !== profileLang) state.selectedLang = profileLang;
});

export default setMessagesReducer;

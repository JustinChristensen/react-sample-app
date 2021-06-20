import { caseReducers, reducer } from '../utils/redux';
import { localeToLang } from '../lang.js';

export const setLocaleReducer = reducer('SET_LOCALE', (state, { locale, browserLocale }) => {
    const { selectedProfile, messages, profiles } = state;
    const listProfile = profiles.find(({ id }) => id === selectedProfile.id);

    if (!locale && !selectedProfile.locale) locale = browserLocale;

    if (locale) selectedProfile.locale = listProfile.locale = locale;
    // if the messages are available, we can set the selected language right away
    // otherwise we must wait until those messages have been loaded. see ./messages.js
    const selectedLang = localeToLang(selectedProfile.locale);
    if (messages && messages[selectedLang]) state.selectedLang = selectedLang;
});

export const setProfilesReducer = reducer('SET_PROFILES', (state, profiles) => {
    state.profiles ||= profiles;
    state.selectedProfile ||= profiles[0];
});

export const selectProfileReducer = reducer('SELECT_PROFILE', (state, { id, browserLocale }) => {
    const { profiles, selectedLang, messages } = state;
    const selectedProfile = state.selectedProfile = profiles.find(p => p.id === id);
    selectedProfile.locale ||= browserLocale;   // set the default locale

    const profileLang = localeToLang(selectedProfile.locale);
    // if the selected lang isn't the same as the profile's lang, and we've got messages
    // we can update the select lang here
    if (selectedLang !== profileLang && messages && messages[profileLang])
        state.selectedLang = profileLang;
});

export default caseReducers(
    setLocaleReducer,
    setProfilesReducer,
    selectProfileReducer
);

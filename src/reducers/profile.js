import { composeReducers, reducer } from '../utils/redux';

export const setLocaleReducer = reducer('SET_LOCALE', (state, locale) => {
    const listProfile = state.profiles.find(({ id }) => id === state.selectedProfile.id);
    state.selectedProfile.locale = listProfile.locale = locale;
    return state;
});

export const setProfilesReducer = reducer('SET_PROFILES', (state, profiles) => {
    state.profiles = profiles;
    state.selectedProfile ||= profiles[0];
    return state;
});

export const selectProfileReducer = reducer('SELECT_PROFILE', (state, profileId) => {
    state.selectedProfile = state.profiles.find(p => p.id === profileId);
    return state;
});

export default composeReducers(
    setLocaleReducer,
    setProfilesReducer,
    selectProfileReducer
);

import { composeReducers, reducer } from '../utils/redux';

export const setProfilesReducer = reducer('SET_PROFILES', (state, profiles) => {
    state.profiles = profiles;
    return state;
});

export const selectProfileReducer = reducer('SELECT_PROFILE', (state, profile) => {
    state.selectedProfile = profile;
    return state;
});

export default composeReducers(
    setProfilesReducer,
    selectProfileReducer
);

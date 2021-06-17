import { reducer } from '../utils/redux';

export const setMessagesReducer = reducer('SET_MESSAGES', (state, messages) => {
    state.messages = messages;
    return state;
});

export default setMessagesReducer;

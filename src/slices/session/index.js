/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import localStorage from 'redux-persist/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export const initialState = {
  id: null,
  displayName: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    reset: () => initialState,
    generateId: (state) => {
      if (!state.id) state.id = uuidv4();
    },
    updateDisplayName: (state, action) => {
      state.displayName = action.payload;
    },
  },
});

export const { reset, generateId, updateDisplayName } = sessionSlice.actions;

export default persistReducer(
  {
    key: 'session',
    storage: localStorage,
  },
  sessionSlice.reducer
);

import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  playlists: [],
};

const roomSlice = createSlice({
  name: 'room',
  initialState,
  reducers: {
    reset: () => initialState,
  },
});

export const { reset } = roomSlice.actions;
export default roomSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import { localStorageTokenKey } from "../utils/constants";

const initialState = {
  token: localStorage.getItem(localStorageTokenKey) || null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action) {
      const { token, user } = action.payload;
      localStorage.setItem(localStorageTokenKey, token);
      state.token = token;
      state.user = user;
    },
    logout(state) {
      localStorage.removeItem(localStorageTokenKey);
      state.token = null;
      state.user = null;
    },
  },
});

export const { setAuth, logout } = authSlice.actions;

export default authSlice.reducer;

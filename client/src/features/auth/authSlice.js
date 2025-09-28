import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    // -- NEW REDUCER TO UPDATE USER INFO --
    updateUserSuccess: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { loginSuccess, logoutSuccess, updateUserSuccess } = authSlice.actions;
export default authSlice.reducer;
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
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    updateUserSuccess: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    // -- NEW REDUCER TO RE-AUTHENTICATE ON PAGE LOAD --
    setUser: (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        // Token is not needed here as it's already in the cookie
    },
  },
});

export const { loginSuccess, logoutSuccess, updateUserSuccess, setUser } = authSlice.actions;
export default authSlice.reducer;
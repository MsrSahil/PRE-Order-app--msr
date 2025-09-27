import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import restaurantReducer from "../features/restaurant/restaurantSlice";
import cartReducer from "../features/cart/cartSlice"; // Import karein
import { saveState } from "../utils/localStorage";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurants: restaurantReducer,
    cart: cartReducer, // Add karein
  },
});

// Listen for store changes and save the cart state to local storage
store.subscribe(() => {
    saveState({
        cart: store.getState().cart
    });
});
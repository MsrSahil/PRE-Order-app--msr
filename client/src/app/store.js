import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import restaurantReducer from "../features/restaurant/restaurantSlice";
import cartReducer, { addItem, removeItem, decreaseQuantity, clearCart, loadCart } from "../features/cart/cartSlice";
import { saveState } from "../utils/localStorage";

// Create a listener middleware
const listenerMiddleware = createListenerMiddleware();

// Add a listener for cart actions
listenerMiddleware.startListening({
  actions: [addItem.type, removeItem.type, decreaseQuantity.type, clearCart.type, loadCart.type],
  effect: (action, listenerApi) => {
    // On any cart change, save the state to local storage
    saveState({
      cart: listenerApi.getState().cart
    });
  }
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurants: restaurantReducer,
    cart: cartReducer,
  },
  // Add the middleware to the store
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(listenerMiddleware.middleware),
});
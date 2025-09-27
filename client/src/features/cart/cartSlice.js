import { createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

const initialState = {
  cartItems: [], // { _id, name, price, quantity }
  totalAmount: 0,
  totalQuantity: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Action to load cart from local storage
    loadCart: (state, action) => {
      const { cartItems, totalAmount, totalQuantity } = action.payload;
      state.cartItems = cartItems || [];
      state.totalAmount = totalAmount || 0;
      state.totalQuantity = totalQuantity || 0;
    },

    addItem: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.cartItems.find(
        (item) => item._id === newItem._id
      );

      state.totalQuantity++;

      if (!existingItem) {
        state.cartItems.push({
          ...newItem,
          quantity: 1,
        });
        toast.success(`${newItem.name} added to cart`);
      } else {
        existingItem.quantity++;
      }

      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + Number(item.price) * Number(item.quantity),
        0
      );
    },
    
    removeItem: (state, action) => {
      const id = action.payload;
      const existingItem = state.cartItems.find((item) => item._id === id);

      if (existingItem) {
        state.cartItems = state.cartItems.filter((item) => item._id !== id);
        state.totalQuantity = state.totalQuantity - existingItem.quantity;
      }

      state.totalAmount = state.cartItems.reduce(
        (total, item) => total + Number(item.price) * Number(item.quantity),
        0
      );
    },
    
    decreaseQuantity: (state, action) => {
        const id = action.payload;
        const existingItem = state.cartItems.find((item) => item._id === id);

        state.totalQuantity--;

        if(existingItem.quantity === 1) {
            state.cartItems = state.cartItems.filter((item) => item._id !== id);
        } else {
            existingItem.quantity--;
        }

        state.totalAmount = state.cartItems.reduce(
            (total, item) => total + Number(item.price) * Number(item.quantity),
            0
        );
    },
    clearCart: (state) => {
        state.cartItems = [];
        state.totalAmount = 0;
        state.totalQuantity = 0;
    }
  },
});

export const { addItem, removeItem, decreaseQuantity, loadCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
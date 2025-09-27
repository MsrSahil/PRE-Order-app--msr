import React from "react";
import { useSelector } from "react-redux";
import CartItem from "./CartItem";
import { Link } from "react-router-dom";

const Cart = ({ isVisible, onClose }) => {
  const { cartItems, totalAmount } = useSelector((state) => state.cart);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}>
      <div
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 p-6 shadow-lg transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold">Your Cart</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <div className="mt-6">
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cartItems.map((item) => <CartItem key={item._id} item={item} />)
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="mt-8 border-t pt-4">
            <div className="flex justify-between font-bold text-xl">
              <span>Total:</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <Link to="/checkout" onClick={onClose}>
              <button className="w-full mt-4 bg-red-600 text-white py-3 rounded-lg text-lg hover:bg-red-700">
                Checkout
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
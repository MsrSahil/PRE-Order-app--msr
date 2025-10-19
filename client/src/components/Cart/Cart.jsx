import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import CartItem from "./CartItem";
import { Link } from "react-router-dom";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const Cart = ({ isVisible, onClose }) => {
  const { cartItems = [], totalAmount = 0 } = useSelector((state) => state.cart) || {};
  const panelRef = useRef(null);

  // Close on Escape and manage focus
  useEffect(() => {
    if (!isVisible) return;

    const prevActive = document.activeElement;

    // Focus the panel for screen readers
    if (panelRef.current) panelRef.current.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      // restore focus
      if (prevActive && prevActive.focus) prevActive.focus();
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={onClose}
      aria-hidden={!isVisible}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        tabIndex={-1}
        className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 p-6 shadow-lg transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-2xl"
            aria-label="Close cart"
          >
            &times;
          </button>
        </div>

        <div className="mt-6 min-h-[120px]">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-600">
              <p>Your cart is empty.</p>
              <Link to="/restaurants" onClick={onClose} className="text-red-600 hover:underline">
                Browse restaurants
              </Link>
            </div>
          ) : (
            cartItems.map((item) => <CartItem key={item._id} item={item} />)
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="mt-8 border-t pt-4">
            <div className="flex justify-between font-bold text-xl">
              <span>Total:</span>
              <span>{currency.format(totalAmount)}</span>
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
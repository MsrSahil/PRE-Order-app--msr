import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutSuccess } from "../../features/auth/authSlice";
import { clearCart } from "../../features/cart/cartSlice";
import api from "../../config/axios";
import toast from "react-hot-toast";
import Cart from "../Cart/Cart";
import Spinner from "../ui/Spinner";

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth || {});
  const cartState = useSelector((state) => state.cart) || {};
  const totalQuantity = cartState.totalQuantity || 0;

  const [isCartVisible, setCartVisible] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      dispatch(logoutSuccess());
      dispatch(clearCart());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.message || "Logout failed";
      toast.error(msg);
    }
  };

  const handleCartToggle = () => setCartVisible((v) => !v);

  // Render navigation based on auth + role
  const renderNavLinks = () => {
    if (!isAuthenticated) {
      return (
        <div className="flex items-center space-x-3">
          <NavLink to="/restaurants" className="text-gray-600 hover:text-red-600 font-medium">
            Restaurants
          </NavLink>
          <NavLink to="/register" className="text-gray-600 hover:text-red-600 font-medium">
            Register
          </NavLink>
          <NavLink
            to="/login"
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-semibold"
          >
            Login
          </NavLink>
        </div>
      );
    }

    // if authenticated but user object not yet populated, show a small loader
    if (isAuthenticated && !user) {
      return <Spinner />;
    }

    const commonElements = (
      <div className="flex items-center space-x-4">
        <NavLink to="/profile" className="font-medium hover:text-red-600">
          {user?.name || "Profile"}
        </NavLink>
        <button
          onClick={handleLogout}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 font-semibold"
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    );

    switch (user?.role) {
      case "customer":
        return (
          <div className="flex items-center space-x-4">
            <NavLink to="/restaurants" className="text-gray-600 hover:text-red-600 font-medium">
              Restaurants
            </NavLink>
            <NavLink to="/my-orders" className="text-gray-600 hover:text-red-600 font-medium">
              My Orders
            </NavLink>

            <button
              type="button"
              onClick={handleCartToggle}
              className="relative focus:outline-none"
              aria-label="Open cart"
            >
              <span className="text-2xl" aria-hidden>
                🛒
              </span>
              {totalQuantity > 0 && (
                <span
                  className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  aria-live="polite"
                >
                  {totalQuantity}
                </span>
              )}
            </button>

            {commonElements}
          </div>
        );

      case "restaurant":
        return (
          <div className="flex items-center space-x-4">
            <NavLink to="/dashboard" className="text-gray-600 hover:text-red-600 font-medium">
              Dashboard
            </NavLink>
            {commonElements}
          </div>
        );

      case "admin":
        return (
          <div className="flex items-center space-x-4">
            <NavLink to="/admin" className="text-gray-600 hover:text-red-600 font-medium">
              Admin
            </NavLink>
            {commonElements}
          </div>
        );

      default:
        return commonElements;
    }
  };

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-red-600" aria-label="PreOrder Home">
            PreOrder
          </Link>

          <nav className="flex items-center" aria-label="Main Navigation">
            {renderNavLinks()}
          </nav>
        </div>
      </header>

      {/* Render Cart for customers only */}
      {user?.role === "customer" && (
        <Cart isVisible={isCartVisible} onClose={() => setCartVisible(false)} />
      )}
    </>
  );
};

export default Header;
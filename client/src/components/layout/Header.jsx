import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutSuccess } from "../../features/auth/authSlice";
import api from "../../api/axios";
import toast from "react-hot-toast";
import Cart from "../Cart/Cart";

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalQuantity } = useSelector((state) => state.cart);
  const [isCartVisible, setCartVisible] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      dispatch(logoutSuccess());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-red-600">
            PreOrder
          </Link>
          <nav className="flex items-center space-x-6">
            <Link to="/restaurants" className="text-gray-600 hover:text-red-600">
              Restaurants
            </Link>
            {isAuthenticated && (
              <Link to="/my-orders" className="text-gray-600 hover:text-red-600">
                My Orders
              </Link>
            )}
            <button onClick={() => setCartVisible(true)} className="relative">
              <span className="text-2xl">🛒</span>
              {totalQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalQuantity}
                </span>
              )}
            </button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="font-medium">
                  {user?.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      <Cart isVisible={isCartVisible} onClose={() => setCartVisible(false)} />
    </>
  );
};

export default Header;
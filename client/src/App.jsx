import React, { useEffect, useState } from "react"; // Import useEffect and useState
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux"; // Import useDispatch
import { setUser } from "./features/auth/authSlice"; // Import the new action
import api from "./config/axios"; // Import api
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Restaurants from "./pages/Restaurants";
import RestaurantMenu from "./pages/RestaurantMenu";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import RestaurantRegister from "./pages/RestaurantRegister";
import Spinner from "./components/ui/Spinner"; // Import Spinner for loading state

// Dashboard Imports
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Dashboard from './pages/dashboard/Dashboard';
import MenuManagement from './pages/dashboard/MenuManagement';
import DashboardProfile from './pages/dashboard/Profile';
import DashboardLogin from './pages/dashboard/DashboardLogin';

// Admin Imports
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageRestaurants from "./pages/admin/ManageRestaurants";


function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true); // Add a loading state

  // This effect runs once when the app starts
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await api.get('/users/me');
        if (response.data) {
          // If server returns user data, dispatch it to the store
          dispatch(setUser(response.data.data));
        }
      } catch (error) {
        // This will fail if the cookie is invalid or expired, which is okay.
        console.log("No active session found.");
      } finally {
        // Stop loading after the check is complete
        setLoading(false);
      }
    };

    checkUserSession();
  }, [dispatch]);

  // Show a loading spinner until the session check is complete
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <Routes>
      {/* --- Main Customer-Facing Layout --- */}
      <Route path="/" element={<Layout />}>
        {/* Public Routes */}
        <Route index element={<Home />} />
        <Route path="register" element={<Register />} />
        <Route path="register-restaurant" element={<RestaurantRegister />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="restaurants" element={<Restaurants />} />
        <Route path="restaurants/:id" element={<RestaurantMenu />} />

        {/* Customer Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<Profile />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:orderId" element={<OrderSuccess />} />
          <Route path="my-orders" element={<MyOrders />} />
        </Route>
      </Route>

      {/* --- Standalone Login for Dashboard --- */}
      <Route path="/dashboard/login" element={<DashboardLogin />} />

      {/* --- Restaurant Dashboard Routes --- */}
      <Route element={<ProtectedRoute restaurantOnly={true} />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="profile" element={<DashboardProfile />} />
        </Route>
      </Route>

      {/* --- Admin Routes --- */}
      <Route element={<ProtectedRoute adminOnly={true} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="restaurants" element={<ManageRestaurants />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
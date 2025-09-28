import React from "react";
import { Routes, Route } from "react-router-dom";
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
import RestaurantRegister from "./pages/RestaurantRegister"; // <-- IMPORT

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
  return (
    <Routes>
      {/* User Facing App Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="register" element={<Register />} />
        <Route path="register-restaurant" element={<RestaurantRegister />} /> {/* <-- NEW ROUTE */}
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password/:token" element={<ResetPassword />} />
        <Route path="restaurants" element={<Restaurants />} />
        <Route path="restaurants/:id" element={<RestaurantMenu />} />

        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<Profile />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success/:orderId" element={<OrderSuccess />} />
          <Route path="my-orders" element={<MyOrders />} />
        </Route>
      </Route>

      {/* Restaurant Dashboard Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="profile" element={<DashboardProfile />} />
      </Route>
      <Route path="/dashboard/login" element={<DashboardLogin />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="restaurants" element={<ManageRestaurants />} />
      </Route>
    </Routes>
  );
}

export default App;
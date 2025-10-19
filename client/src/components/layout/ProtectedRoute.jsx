import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ adminOnly, restaurantOnly }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Determine the correct login page based on the path
    const loginPath = location.pathname.startsWith('/admin')
        ? '/admin/login' // This route doesn't exist yet, but is good for future
        : location.pathname.startsWith('/dashboard')
        ? '/dashboard/login'
        : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }
  
  // If the route is for admins only and the user is not an admin, redirect
  if (adminOnly && user?.role !== 'admin') {
      toast.error("You are not authorized to access this page.");
      return <Navigate to="/" replace />;
  }
  
  // -- NEW: If the route is for restaurants only and the user is not a restaurant owner, redirect --
  if (restaurantOnly && user?.role !== 'restaurant') {
      toast.error("You are not authorized to access the dashboard.");
      return <Navigate to="/" replace />;
  }


  return <Outlet />;
};

export default ProtectedRoute;
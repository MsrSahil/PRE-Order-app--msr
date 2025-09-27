import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ adminOnly }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // User ko sahi login page par bhejein
    const loginPath = location.pathname.startsWith('/admin') || location.pathname.startsWith('/dashboard') 
        ? '/dashboard/login' 
        : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }
  
  // Agar route sirf admin ke liye hai aur user admin nahi hai
  if (adminOnly && user?.role !== 'admin') {
      // User ko home page par bhej dein
      return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
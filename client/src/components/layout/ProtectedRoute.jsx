import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoute = ({ adminOnly }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    const loginPath = location.pathname.startsWith('/admin')
        ? '/admin/login'
        : location.pathname.startsWith('/dashboard')
        ? '/dashboard/login'
        : '/login';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }
  
  if (adminOnly && user?.role !== 'admin') {
      return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
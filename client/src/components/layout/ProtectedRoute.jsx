import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import Spinner from "../ui/Spinner";

const ProtectedRoute = ({ adminOnly, restaurantOnly }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Determine the correct login page based on the path
    const loginPath = location.pathname.startsWith("/admin")
      ? "/admin/login"
      : location.pathname.startsWith("/dashboard")
      ? "/dashboard/login"
      : "/login";

    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // If authenticated but user data is not yet available, show a small loader
  if (isAuthenticated && !user) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spinner />
      </div>
    );
  }

  // Helper component to show a toast and redirect (avoids side-effects during render)
  const UnauthorizedRedirect = ({ message, to = "/" }) => {
    useEffect(() => {
      if (message) toast.error(message);
    }, [message]);
    return <Navigate to={to} replace />;
  };

  // If the route is for admins only and the user is not an admin, redirect
  if (adminOnly && user?.role !== "admin") {
    return (
      <UnauthorizedRedirect message={"You are not authorized to access this page."} to="/" />
    );
  }

  // If the route is for restaurants only and the user is not a restaurant owner, redirect
  if (restaurantOnly && user?.role !== "restaurant") {
    return (
      <UnauthorizedRedirect message={"You are not authorized to access the dashboard."} to="/" />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
import React, { useRef, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "react-hot-toast";

const Layout = () => {
  const mainRef = useRef(null);
  const location = useLocation();

  // Move focus to main content when route changes to improve keyboard navigation
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.focus();
    }
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 bg-white p-2 rounded shadow"
      >
        Skip to content
      </a>

      <Header />

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        role="main"
        className="flex-grow container mx-auto px-4 py-8"
      >
        <Outlet />
      </main>

      <Footer />

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          // default tailwind classes for the toast container
          className:
            "pointer-events-auto bg-white text-gray-900 shadow-lg rounded-lg px-4 py-2 transform transition-all duration-200",
          success: {
            duration: 3500,
            className:
              "pointer-events-auto bg-emerald-500 text-white shadow-lg rounded-lg px-4 py-2 transform transition-all duration-200",
          },
          error: {
            duration: 5000,
            className:
              "pointer-events-auto bg-red-600 text-white shadow-lg rounded-lg px-4 py-2 transform transition-all duration-200",
          },
        }}
        containerClassName="pointer-events-none flex flex-col items-center space-y-2 z-50"
      />
    </div>
  );
};

export default Layout;
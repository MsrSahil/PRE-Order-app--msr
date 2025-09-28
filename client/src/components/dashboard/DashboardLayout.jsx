import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const DashboardLayout = () => {
    // Shared classes for NavLink for consistency
    const linkClasses = "flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-700 transition-colors duration-200";
    const activeLinkClasses = "bg-red-600 text-white hover:bg-red-700 hover:text-white";
    
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-white border-r p-4 flex flex-col justify-between">
                <div>
                    <div className="text-center mb-8">
                        <Link to="/dashboard" className="text-2xl font-bold text-red-600">
                            Dashboard
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">{user?.name}</p>
                    </div>
                    <nav className="space-y-3">
                        <NavLink 
                            to="/dashboard" 
                            end 
                            className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClasses : ""}`}
                        >
                            <span className="mr-3 text-xl">🔥</span>
                            <span>Live Orders</span>
                        </NavLink>
                        <NavLink 
                            to="/dashboard/menu"
                            className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClasses : ""}`}
                        >
                            <span className="mr-3 text-xl">📖</span>
                            <span>Menu Management</span>
                        </NavLink>
                        <NavLink 
                            to="/dashboard/profile"
                            className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClasses : ""}`}
                        >
                            <span className="mr-3 text-xl">🏢</span>
                            <span>Restaurant Profile</span>
                        </NavLink>
                    </nav>
                </div>
                <div>
                    <Link to="/" className="flex items-center justify-center text-sm text-gray-600 hover:text-red-600">
                        <span className="mr-2">←</span> Back to Main Site
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow p-6 md:p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
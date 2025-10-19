import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AdminLayout = () => {
    const linkClasses = "flex items-center px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200";
    const activeLinkClasses = "bg-blue-600 text-white hover:bg-blue-700 hover:text-white";
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-white border-r p-4 flex flex-col justify-between">
                <div>
                    <div className="text-center mb-8">
                        <Link to="/admin" className="text-2xl font-bold text-blue-600">
                            Admin Panel
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">Welcome, {user?.name}</p>
                    </div>
                    <nav className="space-y-3">
                        <NavLink to="/admin" end className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClasses : ""}`}>
                            <span className="mr-3 text-xl">📊</span>
                            <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/admin/users" className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClasses : ""}`}>
                            <span className="mr-3 text-xl">👥</span>
                            <span>Manage Users</span>
                        </NavLink>
                        <NavLink to="/admin/restaurants" className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClasses : ""}`}>
                             <span className="mr-3 text-xl">🏢</span>
                            <span>Manage Restaurants</span>
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

export default AdminLayout;
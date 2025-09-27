import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const AdminLayout = () => {
    const linkClasses = "block px-4 py-2 rounded-md text-gray-700 hover:bg-blue-100 hover:text-blue-600";
    const activeLinkClasses = "bg-blue-600 text-white";

    return (
        <div className="flex">
            <aside className="w-64 bg-white border-r p-4">
                <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
                <nav className="space-y-2">
                    <NavLink to="/admin" end className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClasses : ""}`}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/admin/users" className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClasses : ""}`}>
                        Manage Users
                    </NavLink>
                    <NavLink to="/admin/restaurants" className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClasses : ""}`}>
                        Manage Restaurants
                    </NavLink>
                </nav>
            </aside>
            <main className="flex-grow p-8 bg-gray-50">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
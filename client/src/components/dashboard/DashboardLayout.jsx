import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const DashboardLayout = () => {
    const linkClasses = "block px-4 py-2 rounded-md text-gray-700 hover:bg-red-100 hover:text-red-600";
    const activeLinkClasses = "bg-red-600 text-white";

    return (
        <div className="flex">
            <aside className="w-64 bg-white border-r p-4">
                <nav className="space-y-2">
                    <NavLink 
                        to="/dashboard" 
                        end 
                        className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClasses : ""}`}
                    >
                        Live Orders
                    </NavLink>
                    <NavLink 
                        to="/dashboard/menu"
                        className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClasses : ""}`}
                    >
                        Menu Management
                    </NavLink>
                    <NavLink 
                        to="/dashboard/profile"
                        className={({isActive}) => `${linkClasses} ${isActive ? activeLinkClasses : ""}`}
                    >
                        Restaurant Profile
                    </NavLink>
                </nav>
            </aside>
            <main className="flex-grow p-8 bg-gray-50">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
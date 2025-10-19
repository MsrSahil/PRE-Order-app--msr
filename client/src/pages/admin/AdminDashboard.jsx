import React, { useEffect, useState } from 'react';
import api from '../../config/axios';
import Spinner from '../../components/ui/Spinner';

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border flex items-center">
        <div className="text-4xl mr-4">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await api.get('/admin/stats');
                setStats(response.data.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex justify-center mt-10"><Spinner /></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Users" value={stats?.totalUsers ?? '...'} icon="👥" />
                <StatCard title="Total Restaurants" value={stats?.totalRestaurants ?? '...'} icon="🏢" />
                <StatCard title="Total Orders" value={stats?.totalOrders ?? '...'} icon="📋" />
            </div>
            {/* You can add more components like recent orders or charts here in the future */}
        </div>
    );
};

export default AdminDashboard;
import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/admin/users');
                setUsers(response.data.data);
            } catch (error) {
                toast.error("Failed to fetch users.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return <div className="flex justify-center"><Spinner /></div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
            {/* Yahan par users ki table aayegi */}
        </div>
    );
};

export default ManageUsers;
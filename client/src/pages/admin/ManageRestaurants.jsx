import React, { useEffect, useState } from 'react';
import api from '../../config/axios';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const ManageRestaurants = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                setLoading(true);
                const response = await api.get('/admin/restaurants');
                setRestaurants(response.data.data);
            } catch (error) {
                toast.error("Failed to fetch restaurants.");
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    if (loading) return <div className="flex justify-center"><Spinner /></div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Restaurants</h1>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr className="border-b">
                            <th className="text-left p-3 font-semibold">Restaurant Name</th>
                            <th className="text-left p-3 font-semibold">Owner Name</th>
                            <th className="text-left p-3 font-semibold">Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {restaurants.map(restaurant => (
                            <tr key={restaurant._id} className="border-b hover:bg-gray-50">
                                <td className="p-3">{restaurant.name}</td>
                                <td className="p-3">{restaurant.owner?.name || 'N/A'}</td>
                                <td className="p-3">{restaurant.address}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageRestaurants;
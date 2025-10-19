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

    if (loading) return <div className="flex justify-center mt-10"><Spinner /></div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Manage Restaurants</h1>
            <div className="bg-white p-4 rounded-xl shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Restaurant Name</th>
                                <th scope="col" className="px-6 py-3">Owner Name</th>
                                <th scope="col" className="px-6 py-3">Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {restaurants.map(restaurant => (
                                <tr key={restaurant._id} className="bg-white border-b hover:bg-gray-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{restaurant.name}</th>
                                    <td className="px-6 py-4">{restaurant.owner?.name || 'N/A'}</td>
                                    <td className="px-6 py-4">{restaurant.address}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageRestaurants;
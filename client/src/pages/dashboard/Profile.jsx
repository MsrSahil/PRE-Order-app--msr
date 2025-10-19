import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../config/axios';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';
import { useSelector } from 'react-redux';

const Profile = () => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { user } = useSelector((state) => state.auth);
    const restaurantId = user?.restaurantId;

    useEffect(() => {
        if (!restaurantId) {
            setLoading(false);
            return;
        };
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/restaurants/${restaurantId}`);
                // Format the default values for the form
                const restaurantData = response.data.data.restaurant;
                reset({
                    ...restaurantData,
                    operatingHours: {
                        open: restaurantData.operatingHours?.open || '09:00',
                        close: restaurantData.operatingHours?.close || '22:00'
                    }
                });
            } catch (error) {
                toast.error("Could not fetch restaurant profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [restaurantId, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            await api.put(`/restaurants/${restaurantId}`, data);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center mt-10"><Spinner /></div>
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Restaurant Profile</h1>
            <div className="max-w-2xl bg-white p-6 md:p-8 rounded-xl shadow-lg border">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* ... (keep existing name, address, imageUrl fields) ... */}
                    <div>
                        <label htmlFor="name" className="block font-medium text-gray-700">Restaurant Name</label>
                        <input id="name" {...register('name', { required: 'Name is required' })} type="text" className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="address" className="block font-medium text-gray-700">Address</label>
                        <textarea id="address" {...register('address', { required: 'Address is required' })} className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" rows="3"></textarea>
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="imageUrl" className="block font-medium text-gray-700">Image URL</label>
                        <input id="imageUrl" {...register('imageUrl', { required: 'Image URL is required' })} type="text" className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                        {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>}
                    </div>

                    {/* -- NEW: OPERATING HOURS -- */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-800">Operating Hours</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                            <div>
                                <label htmlFor="openTime" className="block font-medium text-gray-700">Opening Time</label>
                                <input 
                                    id="openTime"
                                    type="time"
                                    {...register('operatingHours.open')}
                                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="closeTime" className="block font-medium text-gray-700">Closing Time</label>
                                <input 
                                    id="closeTime"
                                    type="time"
                                    {...register('operatingHours.close')}
                                    className="w-full mt-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-red-400 transition-colors"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
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
        if (!restaurantId) return;
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/restaurants/${restaurantId}`);
                reset(response.data.data.restaurant);
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
        return <div className="flex justify-center"><Spinner /></div>
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Restaurant Profile</h1>
            <div className="max-w-lg bg-white p-6 rounded-lg shadow-md">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block font-medium">Restaurant Name</label>
                        <input 
                            {...register('name', { required: 'Name is required' })}
                            type="text" 
                            className="w-full mt-1 p-2 border rounded-md" 
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block font-medium">Address</label>
                        <textarea 
                            {...register('address', { required: 'Address is required' })}
                            className="w-full mt-1 p-2 border rounded-md" 
                            rows="3"
                        ></textarea>
                        {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../config/axios';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const restaurantRegisterSchema = z.object({
  // Owner Details
  ownerName: z.string().min(3, 'Owner name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal('')),
  // Restaurant Details
  restaurantName: z.string().min(3, 'Restaurant name is required'),
  address: z.string().min(10, 'Full address is required'),
  imageUrl: z.string().url('Please enter a valid image URL'),
});

const RestaurantRegister = () => {
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(restaurantRegisterSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/users/register-restaurant', data);
      toast.success(response.data.message);
      setIsSuccess(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };
  
  if (isSuccess) {
    return (
        <div className="max-w-lg mx-auto mt-10 text-center p-8 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-2xl font-bold text-green-700">Registration Successful!</h2>
            <p className="mt-4 text-gray-600">Your restaurant profile has been created. You can now log in to your dashboard to manage your menu and orders.</p>
            <Link to="/dashboard/login" className="inline-block mt-6 bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700">
                Go to Dashboard Login
            </Link>
        </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 mb-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Partner with Us</h2>
        <p className="text-gray-500 mt-2">Register your restaurant and start receiving pre-orders today!</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 bg-white p-8 rounded-xl shadow-lg border space-y-6">
        {/* Owner Details Section */}
        <div>
          <h3 className="text-xl font-semibold border-b pb-2 mb-4">Your Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Full Name*</label>
              <input {...register('ownerName')} className="w-full mt-1 p-2 border rounded-md" />
              {errors.ownerName && <p className="text-red-500 text-sm mt-1">{errors.ownerName.message}</p>}
            </div>
            <div>
              <label className="block font-medium">Email Address*</label>
              <input {...register('email')} className="w-full mt-1 p-2 border rounded-md" />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block font-medium">Password*</label>
              <input {...register('password')} type="password" className="w-full mt-1 p-2 border rounded-md" />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block font-medium">Phone Number</label>
              <input {...register('phone')} className="w-full mt-1 p-2 border rounded-md" />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>
          </div>
        </div>
        
        {/* Restaurant Details Section */}
        <div>
          <h3 className="text-xl font-semibold border-b pb-2 mb-4">Restaurant Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block font-medium">Restaurant Name*</label>
              <input {...register('restaurantName')} className="w-full mt-1 p-2 border rounded-md" />
              {errors.restaurantName && <p className="text-red-500 text-sm mt-1">{errors.restaurantName.message}</p>}
            </div>
            <div>
              <label className="block font-medium">Full Address*</label>
              <textarea {...register('address')} rows="3" className="w-full mt-1 p-2 border rounded-md" />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
            </div>
            <div>
              <label className="block font-medium">Image URL*</label>
              <input {...register('imageUrl')} placeholder="https://example.com/image.jpg" className="w-full mt-1 p-2 border rounded-md" />
              {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-600 text-white py-3 rounded-md text-lg font-bold hover:bg-red-700 disabled:bg-red-400"
        >
          {isSubmitting ? 'Registering...' : 'Register Restaurant'}
        </button>
      </form>
    </div>
  );
};

export default RestaurantRegister;
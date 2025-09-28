import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../config/axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams, Link } from 'react-router-dom';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // path of error
});


const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams(); // Get the token from the URL
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await api.put(`/users/reset-password/${token}`, { password: data.password });
      toast.success(response.data.message);
      setIsSuccess(true);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };
  
  if (isSuccess) {
    return (
        <div className="max-w-md mx-auto mt-10 text-center">
            <h2 className="text-2xl font-bold text-green-600">Password Reset Successfully!</h2>
            <p className="mt-4">You can now log in with your new password.</p>
            <Link to="/login" className="inline-block mt-6 bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700">
                Go to Login
            </Link>
        </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-3xl font-bold text-center mb-6">Set a New Password</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register('password')}
            type="password"
            placeholder="New Password"
            className="w-full px-4 py-2 border rounded-md"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>
        <div>
          <input
            {...register('confirmPassword')}
            type="password"
            placeholder="Confirm New Password"
            className="w-full px-4 py-2 border rounded-md"
          />
          {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:bg-red-400"
        >
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
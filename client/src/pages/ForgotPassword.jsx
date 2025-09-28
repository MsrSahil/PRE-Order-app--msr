import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../config/axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const ForgotPassword = () => {
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await api.post('/users/forgot-password', data);
      toast.success(response.data.message);
      setMessage(response.data.message); // Show a confirmation message on the screen
    } catch (error) {
      toast.error(error.response?.data?.message || 'Request failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-3xl font-bold text-center mb-6">Reset Your Password</h2>
      
      {message ? (
        <div className="text-center p-4 bg-green-100 text-green-800 rounded-md">
          <p>{message}</p>
          <Link to="/login" className="text-red-600 font-semibold mt-2 inline-block">
            Back to Login
          </Link>
        </div>
      ) : (
        <>
          <p className="text-center text-gray-600 mb-4">
            Enter your email address and we will send you a link to reset your password.
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <input
                {...register('email')}
                placeholder="Email Address"
                className="w-full px-4 py-2 border rounded-md"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:bg-red-400"
            >
              {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
            </button>
            <p className="text-center">
                <Link to="/login" className="text-sm text-gray-600 hover:text-red-600">
                    Remember your password? Login
                </Link>
            </p>
          </form>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
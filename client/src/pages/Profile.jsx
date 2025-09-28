import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector, useDispatch } from 'react-redux';
import api from '../config/axios';
import toast from 'react-hot-toast';
import { updateUserSuccess } from '../features/auth/authSlice';

// Schema for updating user details
const profileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional().or(z.literal('')),
});

// Schema for changing password
const passwordSchema = z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Form hook for profile details
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile },
    reset: resetProfileForm,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
        name: user?.name || '',
        phone: user?.phone || '',
    }
  });

  // Form hook for password change
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword },
    reset: resetPasswordForm,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  // Handler for updating profile
  const onUpdateProfile = async (data) => {
    try {
      const response = await api.patch('/users/update-account', data);
      dispatch(updateUserSuccess(response.data.data));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  // Handler for changing password
  const onChangePassword = async (data) => {
    try {
      await api.post('/users/change-password', data);
      toast.success('Password changed successfully!');
      resetPasswordForm(); // Clear the form fields on success
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password change failed');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your profile and password.</p>
      </div>

      {/* Update Profile Details Card */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-bold mb-6">Update Profile</h2>
        <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
          <div>
            <label className="block font-medium">Email Address (cannot be changed)</label>
            <input 
              type="email"
              value={user.email}
              disabled
              className="w-full mt-1 p-2 border rounded-md bg-gray-100 cursor-not-allowed" 
            />
          </div>
          <div>
            <label className="block font-medium">Full Name*</label>
            <input 
              {...registerProfile('name')}
              className="w-full mt-1 p-2 border rounded-md" 
            />
            {profileErrors.name && <p className="text-red-500 text-sm mt-1">{profileErrors.name.message}</p>}
          </div>
          <div>
            <label className="block font-medium">Phone Number</label>
            <input 
              {...registerProfile('phone')}
              className="w-full mt-1 p-2 border rounded-md" 
            />
            {profileErrors.phone && <p className="text-red-500 text-sm mt-1">{profileErrors.phone.message}</p>}
          </div>
          <button 
            type="submit"
            disabled={isSubmittingProfile}
            className="w-full sm:w-auto bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400"
          >
            {isSubmittingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password Card */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-bold mb-6">Change Password</h2>
        <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
          <div>
            <label className="block font-medium">Current Password*</label>
            <input 
              {...registerPassword('oldPassword')}
              type="password"
              className="w-full mt-1 p-2 border rounded-md" 
            />
            {passwordErrors.oldPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.oldPassword.message}</p>}
          </div>
          <div>
            <label className="block font-medium">New Password*</label>
            <input 
              {...registerPassword('newPassword')}
              type="password"
              className="w-full mt-1 p-2 border rounded-md" 
            />
            {passwordErrors.newPassword && <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>}
          </div>
          <button 
            type="submit"
            disabled={isSubmittingPassword}
            className="w-full sm:w-auto bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 disabled:bg-gray-500"
          >
            {isSubmittingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
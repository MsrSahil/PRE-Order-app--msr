import React from 'react';
import { useForm } from 'react-hook-form';

const MenuItemForm = ({ onSubmit, defaultValues, isSubmitting }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: defaultValues || { name: '', price: '', description: '', category: '' }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block font-medium">Item Name*</label>
        <input 
          {...register('name', { required: 'Name is required' })}
          className="w-full mt-1 p-2 border rounded-md" 
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block font-medium">Price*</label>
        <input 
          {...register('price', { required: 'Price is required', valueAsNumber: true })}
          type="number" 
          step="0.01"
          className="w-full mt-1 p-2 border rounded-md" 
        />
        {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
      </div>
      <div>
        <label className="block font-medium">Description</label>
        <textarea 
          {...register('description')}
          rows="3"
          className="w-full mt-1 p-2 border rounded-md" 
        />
      </div>
      <div>
        <label className="block font-medium">Category</label>
        <input 
          {...register('category')}
          className="w-full mt-1 p-2 border rounded-md" 
        />
      </div>
      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:bg-red-400"
      >
        {isSubmitting ? 'Saving...' : 'Save Item'}
      </button>
    </form>
  );
};

export default MenuItemForm;
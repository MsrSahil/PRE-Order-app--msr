import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import MenuItemForm from '../../components/dashboard/MenuItemForm';
import { useSelector } from 'react-redux';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useSelector((state) => state.auth);
  const restaurantId = user?.restaurantId;

  const fetchMenu = async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const response = await api.get(`/restaurants/${restaurantId}`);
      setMenuItems(response.data.data.menu);
    } catch (error) {
      toast.error("Could not fetch menu items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [restaurantId]);

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/restaurants/menu/${editingItem._id}`, data);
        toast.success("Item updated successfully!");
      } else {
        await api.post(`/restaurants/${restaurantId}/menu`, data);
        toast.success("Item added successfully!");
      }
      fetchMenu();
      closeModal();
    } catch (error) {
      toast.error("Failed to save item.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (itemId) => {
    if(window.confirm("Are you sure you want to delete this item?")) {
        try {
            await api.delete(`/restaurants/menu/${itemId}`);
            toast.success("Item deleted successfully!");
            fetchMenu();
        } catch (error) {
            toast.error("Failed to delete item.");
        }
    }
  };

  const openModal = (item = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  if (loading) return <div className="flex justify-center"><Spinner /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <button onClick={() => openModal()} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
          Add New Item
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Item Name</th>
              <th className="text-left p-2">Price</th>
              <th className="text-left p-2">Category</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map(item => (
              <tr key={item._id} className="border-b">
                <td className="p-2">{item.name}</td>
                <td className="p-2">₹{item.price}</td>
                <td className="p-2">{item.category}</td>
                <td className="p-2 space-x-2">
                  <button onClick={() => openModal(item)} className="text-blue-500 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isVisible={isModalOpen} onClose={closeModal} title={editingItem ? "Edit Menu Item" : "Add New Menu Item"}>
        <MenuItemForm 
          onSubmit={handleFormSubmit}
          defaultValues={editingItem}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default MenuManagement;
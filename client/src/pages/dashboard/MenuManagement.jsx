import React, { useEffect, useState } from 'react';
import api from '../../config/axios';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import MenuItemForm from '../../components/dashboard/MenuItemForm';
import ToggleSwitch from '../../components/ui/ToggleSwitch'; // Import the new component
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
      // Backend API should ideally return all items for the management view
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

  // --- NEW: Handler for toggling availability ---
  const handleToggleAvailability = async (itemId, currentStatus) => {
    // Optimistic UI update
    setMenuItems(prevItems => prevItems.map(item => 
        item._id === itemId ? { ...item, isAvailable: !currentStatus } : item
    ));

    try {
        await api.patch(`/restaurants/menu/${itemId}/toggle-availability`);
        toast.success(`Item marked as ${!currentStatus ? 'Available' : 'Out of Stock'}`);
    } catch (error) {
        toast.error("Failed to update status.");
        // Revert UI on error
        setMenuItems(prevItems => prevItems.map(item => 
            item._id === itemId ? { ...item, isAvailable: currentStatus } : item
        ));
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

  if (loading) return <div className="flex justify-center mt-10"><Spinner /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <button onClick={() => openModal()} className="bg-red-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-red-700 transition">
          + Add New Item
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Item Name</th>
                  <th scope="col" className="px-6 py-3">Price</th>
                  <th scope="col" className="px-6 py-3">Category</th>
                  <th scope="col" className="px-6 py-3 text-center">Available</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.length > 0 ? menuItems.map(item => (
                  <tr key={item._id} className="bg-white border-b hover:bg-gray-50">
                    <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {item.name}
                    </th>
                    <td className="px-6 py-4">₹{item.price}</td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4 text-center">
                        <ToggleSwitch 
                            enabled={item.isAvailable} 
                            onChange={() => handleToggleAvailability(item._id, item.isAvailable)}
                        />
                    </td>
                    <td className="px-6 py-4 space-x-4 text-right">
                      <button onClick={() => openModal(item)} className="font-medium text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(item._id)} className="font-medium text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                )) : (
                    <tr>
                        <td colSpan="5" className="text-center py-10 text-gray-500">
                            <p>Your menu is empty.</p>
                            <p>Click "Add New Item" to get started.</p>
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
        </div>
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
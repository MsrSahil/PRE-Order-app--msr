import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../config/axios";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../features/cart/cartSlice";
import MenuItemCardSkeleton from "../components/ui/MenuItemCardSkeleton";
import toast from 'react-hot-toast'; // Import toast for user feedback

// Helper function to check if the restaurant is currently open
const isRestaurantOpen = (operatingHours) => {
    if (!operatingHours || !operatingHours.open || !operatingHours.close) {
        return true; // Default to open if hours are not set
    }
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    return currentTime >= operatingHours.open && currentTime <= operatingHours.close;
};


// A dedicated component for each menu item
const MenuItem = ({ item, isOpen }) => {
  const dispatch = useDispatch();
  const [isAdded, setIsAdded] = useState(false);
  const cartItem = useSelector(state => state.cart.cartItems.find(cartItem => cartItem._id === item._id));

  const handleAddItem = () => {
    if (!isOpen) {
        toast.error("This restaurant is currently closed.");
        return;
    }
    dispatch(addItem(item));
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const buttonText = isAdded ? "Added ✔" : "Add to Cart";
  const buttonClass = isAdded
    ? "bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
    : "bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed";

  return (
    <div className="border p-4 rounded-lg flex justify-between items-center shadow-sm">
      <div>
        <h4 className="text-xl font-semibold">{item.name}</h4>
        <p className="text-gray-500 text-sm mt-1">{item.description}</p>
        <p className="text-lg font-bold mt-2">₹{item.price}</p>
      </div>
      <div className="flex flex-col items-center">
        <button onClick={handleAddItem} disabled={!isOpen || !item.isAvailable} className={buttonClass}>
          {item.isAvailable ? buttonText : "Unavailable"}
        </button>
        {cartItem && <span className="text-sm mt-1 text-gray-600">In Cart: {cartItem.quantity}</span>}
      </div>
    </div>
  );
};


const RestaurantMenu = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/restaurants/${id}`);
        setData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurantData();
  }, [id]);

  const categorizedMenu = useMemo(() => {
    if (!data?.menu) return {};
    return data.menu.reduce((acc, item) => {
      const category = item.category || "Miscellaneous";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {});
  }, [data]);

  // --- ERROR FIX PART 1: Guard clauses ---
  if (loading) {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="p-6 rounded-lg bg-gray-200 animate-pulse mb-8">
                <div className="h-10 w-1/2 bg-gray-300 rounded mb-2"></div>
                <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
            </div>
            <div className="h-8 w-1/3 bg-gray-300 rounded mb-6 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, index) => <MenuItemCardSkeleton key={index} />)}
            </div>
        </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
  }
  
  // --- ERROR FIX PART 2: Final safety check before rendering ---
  if (!data || !data.restaurant) {
    // This handles the case where API call succeeds but returns no data
    return <div className="text-center text-gray-500 mt-10">Restaurant not found.</div>;
  }

  const { restaurant } = data;
  const isOpen = isRestaurantOpen(restaurant.operatingHours);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10 p-6 rounded-lg bg-gray-50 border">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight">{restaurant.name}</h1>
                <p className="text-lg text-gray-500 mt-2">{restaurant.address}</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-semibold ${isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isOpen ? 'Open Now' : 'Closed'}
            </div>
        </div>
        {!isOpen && (
            <div className="mt-4 text-center p-3 bg-yellow-100 text-yellow-800 rounded-md">
                You can browse the menu, but ordering is only available from {restaurant.operatingHours.open} to {restaurant.operatingHours.close}.
            </div>
        )}
      </div>

      {Object.keys(categorizedMenu).map((category) => (
        <div key={category} className="mb-10">
          <h2 className="text-3xl font-bold mb-6 border-b-2 border-red-600 pb-2 capitalize">
            {category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categorizedMenu[category].map((item) => (
              <MenuItem key={item._id} item={item} isOpen={isOpen} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RestaurantMenu;
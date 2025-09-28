import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "../config/axios";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "../features/cart/cartSlice";
import MenuItemCardSkeleton from "../components/ui/MenuItemCardSkeleton";

// A dedicated component for each menu item for better state management and cleaner code
const MenuItem = ({ item }) => {
  const dispatch = useDispatch();
  const [isAdded, setIsAdded] = useState(false);
  const cartItem = useSelector(state => state.cart.cartItems.find(cartItem => cartItem._id === item._id));

  const handleAddItem = () => {
    dispatch(addItem(item));
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500); // Reset button state after 1.5s
  };

  const buttonText = isAdded ? "Added ✔" : "Add to Cart";
  const buttonClass = isAdded
    ? "bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
    : "bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300";

  return (
    <div className="border p-4 rounded-lg flex justify-between items-center shadow-sm">
      <div>
        <h4 className="text-xl font-semibold">{item.name}</h4>
        <p className="text-gray-500 text-sm mt-1">{item.description}</p>
        <p className="text-lg font-bold mt-2">₹{item.price}</p>
      </div>
      <div className="flex flex-col items-center">
        <button onClick={handleAddItem} className={buttonClass}>
          {buttonText}
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

  // Memoize the categorized menu to avoid re-calculating on every render
  const categorizedMenu = useMemo(() => {
    if (!data?.menu) return {};
    return data.menu.reduce((acc, item) => {
      const category = item.category || "Miscellaneous";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});
  }, [data]);

  if (loading) {
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header Skeleton */}
            <div className="p-6 rounded-lg bg-gray-200 animate-pulse mb-8">
                <div className="h-10 w-1/2 bg-gray-300 rounded mb-2"></div>
                <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
            </div>
            {/* Menu Skeleton */}
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

  const { restaurant } = data;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Enhanced Restaurant Header */}
      <div className="mb-10 p-6 rounded-lg bg-gray-50 border">
        <h1 className="text-4xl font-extrabold tracking-tight">{restaurant.name}</h1>
        <p className="text-lg text-gray-500 mt-2">{restaurant.address}</p>
      </div>

      {Object.keys(categorizedMenu).map((category) => (
        <div key={category} className="mb-10">
          <h2 className="text-3xl font-bold mb-6 border-b-2 border-red-600 pb-2 capitalize">
            {category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categorizedMenu[category].map((item) => (
              <MenuItem key={item._id} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RestaurantMenu;
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Spinner from "../components/ui/Spinner";
import { useDispatch } from "react-redux";
import { addItem } from "../features/cart/cartSlice";

const RestaurantMenu = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  const handleAddItem = (item) => {
    dispatch(addItem(item));
  };

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

  if (loading) {
    return (
      <div className="flex justify-center mt-10">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
  }

  const { restaurant, menu } = data;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold">{restaurant.name}</h1>
        <p className="text-lg text-gray-500">{restaurant.address}</p>
      </div>

      <h2 className="text-3xl font-bold mb-6 border-b-2 border-red-600 pb-2">
        Menu
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menu.map((item) => (
          <div
            key={item._id}
            className="border p-4 rounded-lg flex justify-between items-center"
          >
            <div>
              <h4 className="text-xl font-semibold">{item.name}</h4>
              <p className="text-gray-500">{item.description}</p>
              <p className="text-lg font-bold mt-2">₹{item.price}</p>
            </div>
            <button
              onClick={() => handleAddItem(item)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantMenu;
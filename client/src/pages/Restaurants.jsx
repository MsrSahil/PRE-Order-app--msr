import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRestaurants } from "../features/restaurant/restaurantSlice";
import { Link } from "react-router-dom";
import Spinner from "../components/ui/Spinner"; // Hum is component ko agle step me banayenge

const RestaurantCard = ({ restaurant }) => (
  <Link to={`/restaurants/${restaurant._id}`} className="block group">
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <img
        src={restaurant.imageUrl}
        alt={restaurant.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-bold">{restaurant.name}</h3>
        <p className="text-gray-600">{restaurant.address}</p>
      </div>
    </div>
  </Link>
);


const Restaurants = () => {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.restaurants);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchRestaurants());
    }
  }, [status, dispatch]);

  if (status === "loading") {
    return <div className="flex justify-center mt-10"><Spinner /></div>;
  }

  if (status === "failed") {
    return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Explore Restaurants</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((restaurant) => (
          <RestaurantCard key={restaurant._id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  );
};

export default Restaurants;
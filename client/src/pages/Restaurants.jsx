import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRestaurants } from "../features/restaurant/restaurantSlice";
import { Link } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import RestaurantCardSkeleton from "../components/ui/RestaurantCardSkeleton"; // Import skeleton

// Enhanced Restaurant Card Component
const RestaurantCard = ({ restaurant }) => (
  <Link to={`/restaurants/${restaurant._id}`} className="block group">
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out">
      <img
        src={restaurant.imageUrl}
        alt={restaurant.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-bold truncate group-hover:text-red-600">{restaurant.name}</h3>
        <p className="text-gray-600 text-sm">{restaurant.address}</p>
      </div>
    </div>
  </Link>
);


const Restaurants = () => {
  const dispatch = useDispatch();
  const { items: allRestaurants, status, error } = useSelector((state) => state.restaurants);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchRestaurants());
    }
  }, [status, dispatch]);

  useEffect(() => {
    // Filter restaurants based on search term
    if (allRestaurants) {
        const filtered = allRestaurants.filter(restaurant => 
            restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredRestaurants(filtered);
    }
  }, [searchTerm, allRestaurants]);


  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Show 6 skeleton cards while loading */}
            {Array.from({ length: 6 }).map((_, index) => (
                <RestaurantCardSkeleton key={index} />
            ))}
        </div>
      );
    }
  
    if (status === "failed") {
      return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
    }

    if (filteredRestaurants.length === 0) {
        return <div className="text-center text-gray-500 mt-10">No restaurants found.</div>
    }
  
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
            ))}
        </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Explore Restaurants</h1>
        <p className="text-lg text-gray-500">Find your next favorite meal.</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 max-w-lg mx-auto">
        <input 
            type="text"
            placeholder="Search for a restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
        />
      </div>
      
      {renderContent()}

    </div>
  );
};

export default Restaurants;
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchRestaurants } from "../features/restaurant/restaurantSlice";
import RestaurantCardSkeleton from "../components/ui/RestaurantCardSkeleton";

// Re-using the RestaurantCard from Restaurants.jsx for consistency
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


const Home = () => {
  const dispatch = useDispatch();
  const { items: restaurants, status } = useSelector((state) => state.restaurants);

  useEffect(() => {
    // Fetch restaurants if they are not already loaded
    if (status === "idle") {
      dispatch(fetchRestaurants());
    }
  }, [status, dispatch]);
  
  // Get first 3 restaurants to feature
  const featuredRestaurants = restaurants.slice(0, 3);

  return (
    <div className="space-y-20">
      {/* 1. Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
          <span className="block">Skip the wait,</span>
          <span className="block text-red-600">not the meal.</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
          Pre-order from your favorite local restaurants and have your food hot and ready the moment you arrive.
        </p>
        <div className="mt-8">
          <Link
            to="/restaurants"
            className="inline-block bg-red-600 text-white px-10 py-4 rounded-lg text-lg font-bold hover:bg-red-700 transition-transform hover:scale-105 shadow-lg"
          >
            Find a Restaurant
          </Link>
        </div>
      </section>

      {/* 2. How It Works Section */}
      <section>
        <div className="text-center">
            <h2 className="text-3xl font-bold">How It Works</h2>
            <p className="text-gray-500 mt-2">Get your meal in 3 simple steps.</p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="p-6">
                <div className="text-5xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold">1. Browse & Choose</h3>
                <p className="text-gray-600 mt-2">Explore menus from a variety of local restaurants.</p>
            </div>
            <div className="p-6">
                <div className="text-5xl mb-4">💳</div>
                <h3 className="text-xl font-semibold">2. Pre-Order & Pay</h3>
                <p className="text-gray-600 mt-2">Select your items, set your arrival time, and pay securely online.</p>
            </div>
            <div className="p-6">
                <div className="text-5xl mb-4">🏃‍♂️</div>
                <h3 className="text-xl font-semibold">3. Pick Up & Enjoy</h3>
                <p className="text-gray-600 mt-2">Arrive at the restaurant, skip the queue, and enjoy your meal.</p>
            </div>
        </div>
      </section>

      {/* 3. Featured Restaurants Section */}
      <section>
        <div className="text-center">
            <h2 className="text-3xl font-bold">Featured Restaurants</h2>
            <p className="text-gray-500 mt-2">Start your order with one of these popular spots.</p>
        </div>
        <div className="mt-10">
            {status === 'loading' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <RestaurantCardSkeleton />
                    <RestaurantCardSkeleton />
                    <RestaurantCardSkeleton />
                </div>
            )}
            {status === 'succeeded' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {featuredRestaurants.map(restaurant => (
                        <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                    ))}
                </div>
            )}
        </div>
      </section>
    </div>
  );
};

export default Home;
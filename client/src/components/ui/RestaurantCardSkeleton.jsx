import React from 'react';

const RestaurantCardSkeleton = () => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg animate-pulse">
      <div className="w-full h-48 bg-gray-300"></div>
      <div className="p-4">
        <div className="h-6 w-3/4 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export default RestaurantCardSkeleton;
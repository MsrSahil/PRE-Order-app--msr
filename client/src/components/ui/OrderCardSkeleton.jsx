import React from 'react';

const OrderCardSkeleton = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="h-6 w-48 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 w-56 bg-gray-300 rounded"></div>
        </div>
        <div className="text-right">
          <div className="h-7 w-24 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 w-20 bg-gray-300 rounded"></div>
        </div>
      </div>
      <div className="h-5 w-32 bg-gray-300 rounded"></div>
    </div>
  );
};

export default OrderCardSkeleton;
import React from 'react';

const MenuItemCardSkeleton = () => {
  return (
    <div className="border p-4 rounded-lg flex justify-between items-center animate-pulse">
      <div className="flex-grow">
        <div className="h-5 w-1/2 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 w-3/4 bg-gray-300 rounded mb-3"></div>
        <div className="h-5 w-1/4 bg-gray-300 rounded"></div>
      </div>
      <div className="w-24 h-10 bg-gray-300 rounded-lg ml-4"></div>
    </div>
  );
};

export default MenuItemCardSkeleton;
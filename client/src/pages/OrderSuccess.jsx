import React from 'react';
import { Link, useParams } from 'react-router-dom';

const OrderSuccess = () => {
    const { orderId } = useParams();

    return (
        <div className="text-center max-w-lg mx-auto">
            <h1 className="text-3xl font-bold text-green-600">Order Placed Successfully! ✅</h1>
            <p className="mt-4 text-lg">Thank you for your order. Your food will be ready when you arrive.</p>
            <p className="mt-2">
                Your Order ID is: <span className="font-mono bg-gray-200 p-1 rounded">{orderId}</span>
            </p>
            <Link to="/my-orders" className="inline-block mt-6 bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700">
                View My Orders
            </Link>
        </div>
    );
};

export default OrderSuccess;
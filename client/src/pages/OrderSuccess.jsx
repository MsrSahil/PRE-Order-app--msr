import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../config/axios';
import Spinner from '../components/ui/Spinner';

const OrderSuccess = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/orders/${orderId}`);
                setOrder(response.data.data);
            } catch (error) {
                console.error("Failed to fetch order details:", error);
                // Handle error, maybe show a generic success message
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrderDetails();
        }
    }, [orderId]);

    if (loading) {
        return <div className="flex justify-center mt-10"><Spinner /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
                <span className="text-6xl">✅</span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-green-600 mt-4">Order Placed Successfully!</h1>
                <p className="mt-2 text-lg text-gray-500">Thank you for your order. Your food will be ready when you arrive.</p>
            </div>

            {order && (
                <div className="bg-white p-6 rounded-xl shadow-lg border text-left space-y-4">
                    <h2 className="text-2xl font-bold text-center border-b pb-3 mb-4">Order Summary</h2>
                    
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">Order ID:</span>
                        <span className="font-mono text-gray-800">{order._id}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">Restaurant:</span>
                        <span className="font-bold text-gray-800">{order.restaurant.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-semibold text-gray-600">Your ETA:</span>
                        <span className="font-bold text-gray-800">{order.eta}</span>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2">Items Ordered:</h3>
                        <ul className="space-y-2">
                            {order.items.map(item => (
                                <li key={item._id} className="flex justify-between text-sm">
                                    <span>{item.quantity} x {item.menuItem.name}</span>
                                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="border-t pt-3 flex justify-between font-bold text-xl">
                        <span>Total Amount:</span>
                        <span className="text-red-600">₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            )}

            <div className="mt-8">
                <Link to="/my-orders" className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
                    View My Orders
                </Link>
                <Link to="/restaurants" className="inline-block ml-4 text-gray-600 font-semibold hover:text-red-600 transition">
                    Order More
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccess;
import React, { useEffect, useState } from "react";
import api from "../config/axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import OrderCardSkeleton from "../components/ui/OrderCardSkeleton"; // Import skeleton

// Helper to get color based on status
const getStatusBadge = (status) => {
    switch (status) {
        case 'confirmed':
        case 'preparing':
            return 'bg-blue-100 text-blue-800';
        case 'ready_for_pickup':
            return 'bg-yellow-100 text-yellow-800';
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get("/orders/my-orders");
        // We need to populate menu items to display their names
        const populatedOrders = await Promise.all(response.data.data.map(async (order) => {
            const populatedItems = await Promise.all(order.items.map(async (item) => {
                // This is a workaround if backend doesn't populate nested items.
                // Ideally, backend should populate items.menuItem
                if (typeof item.menuItem === 'string') {
                    // Assuming you have an endpoint to fetch a menuItem by ID
                    // This is inefficient. It's better to fix the backend population.
                    // For now, we'll assume the backend sends populated data.
                }
                return item;
            }));
            return { ...order, items: populatedItems };
        }));
        setOrders(response.data.data); // Assuming backend populates correctly
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
        try {
            await api.put(`/orders/${orderId}/cancel`);
            toast.success("Order cancelled successfully!");
            fetchOrders(); // Refresh the order list
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to cancel order");
        }
    }
  };

  const canCancel = (order) => {
    const fiveMinutes = 5 * 60 * 1000;
    const orderTime = new Date(order.createdAt).getTime();
    const currentTime = new Date().getTime();
    // Allow cancellation only for 'pending' or 'confirmed' orders within the time limit
    return currentTime - orderTime < fiveMinutes && ['pending', 'confirmed'].includes(order.status);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => <OrderCardSkeleton key={index} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">Error: {error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center mt-10">
        <h1 className="text-3xl font-bold">You haven't placed any orders yet.</h1>
        <p className="text-gray-500 mt-2">Let's find you something delicious!</p>
        <Link to="/restaurants" className="mt-6 inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-transform hover:scale-105">
          Browse Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white p-6 rounded-xl shadow-lg border transition-shadow hover:shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
              <div>
                <p className="font-bold text-xl text-gray-800">
                  {order.restaurant.name}
                </p>
                <p className="text-sm text-gray-500">
                  Order ID: <span className="font-mono">{order._id}</span>
                </p>
              </div>
              <div className="text-left sm:text-right mt-2 sm:mt-0">
                <p className="font-bold text-xl">₹{order.totalAmount.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* --- Order Items --- */}
            <div className="border-t border-b my-4 py-3">
                <h4 className="font-semibold mb-2">Items:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {order.items.map(item => (
                        // Backend needs to populate menuItem for this to work
                        <li key={item._id}>{item.quantity} x {item.menuItem?.name || 'Item'}</li>
                    ))}
                </ul>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Status: </span>
                <span className={`capitalize text-sm font-medium px-3 py-1 rounded-full ${getStatusBadge(order.status)}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
              {canCancel(order) && (
                <button 
                  onClick={() => handleCancelOrder(order._id)}
                  className="bg-red-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                    Cancel Order
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
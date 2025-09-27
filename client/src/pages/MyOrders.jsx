import React, { useEffect, useState } from "react";
import api from "../api/axios";
import Spinner from "../components/ui/Spinner";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.get("/orders/my-orders");
        setOrders(response.data.data);
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
    if (window.confirm("Are you sure you want to cancel this order?")) {
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
    return currentTime - orderTime < fiveMinutes && order.status !== 'cancelled' && order.status !== 'completed';
  };

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

  if (orders.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">You haven't placed any orders yet.</h1>
        <Link to="/restaurants" className="mt-4 inline-block bg-red-600 text-white px-6 py-2 rounded-lg">
          Start Ordering
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-bold text-lg">
                  Order at {order.restaurant.name}
                </p>
                <p className="text-sm text-gray-500">
                  Order ID: <span className="font-mono">{order._id}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-xl">₹{order.totalAmount.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-semibold">Status: </span>
                <span className={`capitalize font-medium ${order.status === 'cancelled' ? 'text-red-500' : 'text-green-600'}`}>
                  {order.status}
                </span>
              </div>
              {canCancel(order) && (
                <button 
                  onClick={() => handleCancelOrder(order._id)}
                  className="bg-red-500 text-white text-sm px-3 py-1 rounded-md hover:bg-red-600"
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
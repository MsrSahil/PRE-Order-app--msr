import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import api from '../../config/axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Spinner from '../../components/ui/Spinner';

// Helper to calculate time ago
const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
};

// Helper for status colors
const getStatusStyles = (status) => {
    switch (status) {
        case 'confirmed':
        case 'pending':
            return 'border-l-4 border-blue-500';
        case 'preparing':
            return 'border-l-4 border-yellow-500';
        case 'ready_for_pickup':
            return 'border-l-4 border-green-500';
        case 'cancelled':
            return 'border-l-4 border-red-500';
        default:
            return 'border-l-4 border-gray-300';
    }
};

const OrderCard = ({ order, onStatusChange, onReject }) => { // Add onReject prop
  return (
    <div className={`bg-white p-4 rounded-lg shadow-md ${getStatusStyles(order.status)}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-lg">Order #{order._id.slice(-6)}</h3>
          <p className="text-sm text-gray-500">By: {order.user.name}</p>
        </div>
        <span className="font-bold text-lg">₹{order.totalAmount}</span>
      </div>
      <p className="text-sm text-gray-600 font-medium">ETA: {order.eta}</p>
      <div className="mt-3">
        <h4 className="font-semibold">Items:</h4>
        <ul className="list-disc list-inside text-sm text-gray-700">
          {order.items.map(item => (
            <li key={item.menuItem._id}>{item.quantity} x {item.menuItem.name}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4 border-t pt-3 flex flex-col gap-3">
        <div className="flex items-center gap-2">
            <label htmlFor={`status-${order._id}`} className="text-sm font-medium">Status:</label>
            <select
              id={`status-${order._id}`}
              value={order.status}
              disabled={order.status === 'cancelled' || order.status === 'completed'} // Disable if order is final
              onChange={(e) => onStatusChange(order._id, e.target.value)}
              className="p-2 border rounded-md flex-grow bg-gray-50 disabled:bg-gray-200"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
        </div>
        
        {/* -- NEW: REJECT BUTTON -- */}
        {(order.status === 'pending' || order.status === 'confirmed') && (
            <button
                onClick={() => onReject(order._id)}
                className="w-full bg-red-100 text-red-700 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
            >
                Reject Order
            </button>
        )}

        <p className="text-xs text-gray-400 text-right">
            Received: {timeAgo(order.createdAt)}
        </p>
      </div>
    </div>
  );
};


const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state) => state.auth);
    const restaurantId = user?.restaurantId;
    const notificationSound = useRef(null);

    useEffect(() => {
        notificationSound.current = new Audio('/notification.mp3');
    }, []);

    useEffect(() => {
        if (!restaurantId) return;
        
        api.get(`/orders/restaurant/${restaurantId}`)
            .then(response => setOrders(response.data.data))
            .catch(() => toast.error("Failed to fetch initial orders."))
            .finally(() => setLoading(false));
    }, [restaurantId]);

    useEffect(() => {
        if (!restaurantId) return;

        const socket = io('http://localhost:8000'); 

        socket.on("connect", () => {
            socket.emit("joinRestaurantRoom", restaurantId);
        });

        socket.on("newOrder", (newOrder) => {
            toast.success(`New Order #${newOrder._id.slice(-6)} received!`);
            notificationSound.current?.play().catch(e => console.error("Error playing sound:", e));
            setOrders(prevOrders => [newOrder, ...prevOrders]);
        });
        
        socket.on("orderStatusUpdate", (updatedOrder) => {
            toast.info(`Order #${updatedOrder._id.slice(-6)} was updated.`);
            setOrders(prevOrders => 
                prevOrders.map(o => o._id === updatedOrder._id ? updatedOrder : o)
            );
        });

        return () => {
            socket.disconnect();
        };

    }, [restaurantId]);
    
    const handleStatusChange = async (orderId, newStatus) => {
      try {
        await api.put(`/orders/${orderId}/status`, { status: newStatus });
        toast.success(`Order status updated to ${newStatus}`);
      } catch (error) {
        toast.error("Failed to update status");
      }
    };

    // -- NEW: Handler for rejecting an order --
    const handleRejectOrder = async (orderId) => {
        if(window.confirm("Are you sure you want to reject this order? This will initiate a refund and cannot be undone.")) {
            try {
                await api.put(`/orders/${orderId}/reject`);
                toast.success("Order has been rejected.");
                // UI will update automatically via the 'orderStatusUpdate' socket event
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to reject order.");
            }
        }
    };

    if (loading) {
        return <div className="flex justify-center mt-10"><Spinner /></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Live Orders</h1>
            {orders.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <p className="text-xl text-gray-500">No active orders at the moment. 🍽️</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {orders.map(order => (
                        <OrderCard 
                            key={order._id} 
                            order={order} 
                            onStatusChange={handleStatusChange}
                            onReject={handleRejectOrder} // Pass the handler
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
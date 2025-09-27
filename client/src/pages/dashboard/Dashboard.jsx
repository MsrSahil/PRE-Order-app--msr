import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import api from '../../config/axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import Spinner from '../../components/ui/Spinner'; // Assuming you have a Spinner component

const OrderCard = ({ order, onStatusChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="font-bold">Order #{order._id.slice(-6)}</h3>
          <p className="text-sm text-gray-500">By: {order.user.name}</p>
        </div>
        <span className="font-bold text-lg">₹{order.totalAmount}</span>
      </div>
      <p className="text-sm text-gray-600 font-medium">ETA: {order.eta}</p>
      <div className="mt-2">
        <h4 className="font-semibold">Items:</h4>
        <ul className="list-disc list-inside text-sm">
          {order.items.map(item => (
            <li key={item.menuItem._id}>{item.quantity} x {item.menuItem.name}</li>
          ))}
        </ul>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <label htmlFor={`status-${order._id}`} className="text-sm font-medium">Status:</label>
        <select
          id={`status-${order._id}`}
          value={order.status}
          onChange={(e) => onStatusChange(order._id, e.target.value)}
          className="p-2 border rounded-md flex-grow bg-gray-50"
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready_for_pickup">Ready for Pickup</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>
  );
};


const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state) => state.auth);
    const restaurantId = user?.restaurantId;

    // Fetch initial orders via API
    useEffect(() => {
        if (!restaurantId) return;
        
        const fetchInitialOrders = async () => {
            try {
                setLoading(true);
                // Fetch only active orders for the dashboard view
                const response = await api.get(`/orders/restaurant/${restaurantId}`);
                setOrders(response.data.data);
            } catch (error) {
                toast.error("Failed to fetch initial orders.");
            } finally {
                setLoading(false);
            }
        };

        fetchInitialOrders();
    }, [restaurantId]);


    // Setup WebSocket connection after initial fetch
    useEffect(() => {
        if (!restaurantId) return;

        // Connect to the socket server (ensure the URL is correct)
        const socket = io('http://localhost:8000'); 

        socket.on("connect", () => {
            console.log("Connected to socket server with ID:", socket.id);
            socket.emit("joinRestaurantRoom", restaurantId);
        });

        socket.on("newOrder", (newOrder) => {
            toast.success(`New Order #${newOrder._id.slice(-6)} received!`);
            // Add the new order only if it doesn't already exist in the state
            setOrders(prevOrders => {
                if (prevOrders.some(o => o._id === newOrder._id)) {
                    return prevOrders;
                }
                return [newOrder, ...prevOrders];
            });
        });
        
        socket.on("orderStatusUpdate", (updatedOrder) => {
            // Update the status of an existing order in real-time
            setOrders(prevOrders => 
                prevOrders.map(o => o._id === updatedOrder._id ? updatedOrder : o)
            );
        });

        // Clean up the connection when the component unmounts
        return () => {
            console.log("Disconnecting socket...");
            socket.disconnect();
        };

    }, [restaurantId]);
    
    const handleStatusChange = async (orderId, newStatus) => {
      try {
        await api.put(`/orders/${orderId}/status`, { status: newStatus });
        // The optimistic update is now handled by the 'orderStatusUpdate' socket event
        toast.success(`Order status updated to ${newStatus}`);
      } catch (error) {
        toast.error("Failed to update status");
      }
    };

    if (loading) {
        return <div className="flex justify-center mt-10"><Spinner /></div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Live Orders Dashboard</h1>
            {orders.length === 0 ? (
                <p>No active orders at the moment.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map(order => (
                        <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
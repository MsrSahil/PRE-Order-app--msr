import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const OrderCard = ({ order, onStatusChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">Order #{order._id.slice(-6)}</h3>
        <span className="font-bold text-lg">₹{order.totalAmount}</span>
      </div>
      <p className="text-sm text-gray-500">By: {order.user.name}</p>
      <p className="text-sm text-gray-500">ETA: {order.eta}</p>
      <div className="mt-2">
        <h4 className="font-semibold">Items:</h4>
        <ul className="list-disc list-inside text-sm">
          {order.items.map(item => (
            <li key={item._id}>{item.quantity} x {item.menuItem.name} (ID: {item.menuItem.slice(-4)})</li>
          ))}
        </ul>
      </div>
      <div className="mt-4 flex gap-2">
        <select 
          value={order.status} 
          onChange={(e) => onStatusChange(order._id, e.target.value)}
          className="p-2 border rounded-md flex-grow"
        >
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="ready_for_pickup">Ready for Pickup</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
};


const Dashboard = () => {
    const [orders, setOrders] = useState([]);
    const { user } = useSelector((state) => state.auth);
    const restaurantId = user?.restaurantId;

    useEffect(() => {
        if (!restaurantId) return;

        const socket = io("http://localhost:8000"); 

        socket.on("connect", () => {
            console.log("Connected to socket server");
            socket.emit("joinRestaurantRoom", restaurantId);
        });

        socket.on("newOrder", (newOrder) => {
            toast.success(`New Order #${newOrder._id.slice(-6)} received!`);
            setOrders(prevOrders => [newOrder, ...prevOrders]);
        });

        return () => {
            socket.disconnect();
        };

    }, [restaurantId]);
    
    const handleStatusChange = async (orderId, newStatus) => {
      try {
        await api.put(`/orders/${orderId}/status`, { status: newStatus });
        setOrders(prevOrders => 
          prevOrders.map(o => o._id === orderId ? { ...o, status: newStatus } : o)
        );
        toast.success(`Order status updated to ${newStatus}`);
      } catch (error) {
        toast.error("Failed to update status");
      }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Live Orders Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map(order => (
                    <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
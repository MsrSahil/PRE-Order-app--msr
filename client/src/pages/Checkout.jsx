import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import api from "../config/axios";
import toast from "react-hot-toast";
import { clearCart } from "../features/cart/cartSlice";

const Checkout = () => {
  const { cartItems, totalAmount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [eta, setEta] = useState("30 minutes");
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // Redirect to home if cart is empty
    if (cartItems.length === 0) {
        navigate('/');
    }
    
    const fetchRazorpayKey = async () => {
      try {
        const { data } = await api.get("/payments/razorpay-key");
        setRazorpayKey(data.data.key);
      } catch (error) {
        toast.error("Failed to fetch payment details. Please try again later.");
      }
    };
    fetchRazorpayKey();
  }, [cartItems, navigate]);

  const handlePayment = async () => {
    if (!razorpayKey) {
      toast.error("Payment details are not available. Please wait and try again.");
      return;
    }
	
    setIsProcessing(true);
    try {
      const orderResponse = await api.post("/orders", {
        cartItems,
        totalAmount,
        eta,
      });
      const internalOrder = orderResponse.data.data;

      const { data: { data: razorpayOrder } } = await api.post("/payments/create-order", {
        amount: totalAmount,
        orderId: internalOrder._id,
      });

      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "PreOrder App",
        description: "Meal Pre-Order Transaction",
        order_id: razorpayOrder.id,
        handler: function (response) {
          toast.success("Payment successful! Awaiting confirmation.");
          dispatch(clearCart());
          navigate(`/order-success/${internalOrder._id}`);
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        theme: {
          color: "#EF4444",
        },
        modal: {
            ondismiss: function() {
                toast.error("Payment was not completed.");
                setIsProcessing(false);
            }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
      setIsProcessing(false);
    }
  };
  
return (
    <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight">Final Step: Checkout</h1>
            <p className="mt-2 text-lg text-gray-500">Review your order and make the payment.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column: Order Summary */}
            <div className="bg-white p-6 rounded-xl shadow-lg border">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                    <span className="text-2xl mr-3">🛒</span>
                    Order Summary
                </h2>
                <div className="space-y-4">
                    {cartItems.map((item) => (
                        <div key={item._id} className="flex justify-between items-center border-b pb-3">
                            <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-gray-500">
                                    ₹{item.price} x {item.quantity}
                                </p>
                            </div>
                            <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                    <div className="pt-4 flex justify-between font-bold text-xl">
                        <span>Total Amount</span>
                        <span className="text-red-600">₹{totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Details & Payment */}
            <div className="bg-white p-6 rounded-xl shadow-lg border">
                <h2 className="text-2xl font-bold mb-6">Your Details</h2>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="eta" className="block text-sm font-medium text-gray-700 mb-2">
                            <span className="text-xl mr-2">🕒</span>
                            When will you arrive? (ETA)
                        </label>
                        <select
                            id="eta"
                            value={eta}
                            onChange={(e) => setEta(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="30 minutes">In 30 Minutes</option>
                            <option value="45 minutes">In 45 Minutes</option>
                            <option value="1 hour">In 1 Hour</option>
                            <option value="1.5 hours">In 1.5 Hours</option>
                        </select>
                    </div>
                    <button
                        onClick={handlePayment}
                        disabled={isProcessing || !razorpayKey || cartItems.length === 0}
                        className="w-full flex justify-center items-center bg-red-600 text-white py-3 px-4 rounded-lg text-lg font-bold hover:bg-red-700 disabled:bg-red-300 transition-all duration-300"
                    >
                        <span className="text-xl mr-2">🔒</span>
                        {isProcessing ? 'Processing...' : `Pay Securely ₹${totalAmount.toFixed(2)}`}
                    </button>
                </div>
            </div>
        </div>
    </div>
);
};

export default Checkout;
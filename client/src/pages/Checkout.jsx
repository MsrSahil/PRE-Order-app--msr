import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
    const fetchRazorpayKey = async () => {
      try {
        const { data } = await api.get("/payments/razorpay-key");
        setRazorpayKey(data.data.key); // Correctly access the nested key
      } catch (error) {
        toast.error("Failed to fetch payment details. Please try again later.");
      }
    };
    fetchRazorpayKey();
  }, []);

  const handlePayment = async () => {
    if (!razorpayKey) {
      toast.error("Payment details are not available yet. Please wait a moment and try again.");
      return;
    }
	
    setIsProcessing(true);
    try {
      // Step 1: Create a 'pending' order in our database first.
      const orderResponse = await api.post("/orders", {
        cartItems,
        totalAmount,
        eta,
      });
      const internalOrder = orderResponse.data.data;

      // Step 2: Create a Razorpay order using our internal order details.
      const { data: { data: razorpayOrder } } = await api.post("/payments/create-order", {
        amount: totalAmount,
        orderId: internalOrder._id, // Send our internal order ID
      });

      // Step 3: Open Razorpay Checkout Modal
      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "PreOrder App",
        description: "Meal Pre-Order Transaction",
        order_id: razorpayOrder.id,
        handler: function (response) {
          // **NO VERIFICATION HERE**
          // The webhook will handle verification.
          // On success, we just clear the cart and navigate.
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
                // Handle case where user closes the payment modal
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
    // No 'finally' block needed here for setIsProcessing, as the modal has its own lifecycle
  };
  
  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Order Summary */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
        <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
          {cartItems.map((item) => (
            <div key={item._id} className="flex justify-between">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
            <span>Total Amount</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Form */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Details</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="eta" className="block font-medium mb-1">
              Estimated Time of Arrival (ETA)
            </label>
            <select
              id="eta"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="30 minutes">30 Minutes</option>
              <option value="45 minutes">45 Minutes</option>
              <option value="1 hour">1 Hour</option>
              <option value="1.5 hours">1.5 Hours</option>
            </select>
          </div>
          <button
            onClick={handlePayment}
            disabled={isProcessing || !razorpayKey}
            className="w-full bg-red-600 text-white py-3 rounded-lg text-lg font-bold hover:bg-red-700 disabled:bg-red-400"
          >
            {isProcessing ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
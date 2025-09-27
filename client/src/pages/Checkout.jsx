import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { clearCart } from "../features/cart/cartSlice";

const Checkout = () => {
  const { cartItems, totalAmount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const [eta, setEta] = useState("30 minutes");
  const [isProcessing, setIsProcessing] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Step 1: Create a 'pending' order in our database
      const orderResponse = await api.post("/orders", {
        cartItems,
        totalAmount,
        eta,
      });
      const internalOrder = orderResponse.data.data;

      // Step 2: Create a Razorpay order
      const { data: { data: razorpayOrder } } = await api.post("/payments/create-order", {
        amount: totalAmount,
      });

      // Step 3: Open Razorpay Checkout Modal
      const options = {
        key: "rzp_test_RMenRuSGmyCaPt", // Apni Key ID yahan daalein
        amount: razorpayOrder.amount,
        currency: "INR",
        name: "PreOrder App",
        description: "Test Transaction",
        order_id: razorpayOrder.id,
        handler: async function (response) {
          // Step 4: Verify the payment
          try {
            const verificationResponse = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: internalOrder._id, // Hamara database order ID
            });
            toast.success("Payment successful!");
            dispatch(clearCart());
            navigate(`/order-success/${internalOrder._id}`);
          } catch (error) {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        theme: {
          color: "#EF4444",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  // client/src/pages/Checkout.jsx ka return statement
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
            disabled={isProcessing}
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
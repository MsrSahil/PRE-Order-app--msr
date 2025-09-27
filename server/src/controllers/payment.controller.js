import Razorpay from "razorpay";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  const options = {
    amount: Number(amount * 100), // Amount in the smallest currency unit (paise)
    currency: "INR",
  };
  const order = await instance.orders.create(options);

  if (!order) {
    throw new ApiError(500, "Failed to create payment order");
  }

  res.status(200).json(new ApiResponse(200, order, "Order created"));
});

const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId, // Yeh hamare database ka order ID hai
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Payment is authentic, now update the order status in DB
    await Order.findByIdAndUpdate(orderId, {
        status: 'confirmed',
        paymentDetails: {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        }
    });

    res.status(200).json(new ApiResponse(200, { paymentId: razorpay_payment_id }, "Payment verified successfully"));
    
  } else {
    throw new ApiError(400, "Payment verification failed");
  }
});

export { createPaymentOrder, verifyPayment };
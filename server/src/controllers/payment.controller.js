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

// @desc    Get Razorpay Key ID
// @route   GET /api/v1/payments/razorpay-key
const getRazorpayKey = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { key: process.env.RAZORPAY_KEY_ID }, "Key sent successfully"));
});


// @desc    Create a payment order
// @route   POST /api/v1/payments/create-order
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, orderId } = req.body; // We'll now receive our internal orderId

  if (!orderId) {
    throw new ApiError(400, "Internal Order ID is required");
  }

  const options = {
    amount: Number(amount * 100),
    currency: "INR",
    receipt: orderId, // Using our internal order ID as the receipt
  };

  const razorpayOrder = await instance.orders.create(options);

  if (!razorpayOrder) {
    throw new ApiError(500, "Failed to create Razorpay order");
  }

  // Link Razorpay order ID to our internal order
  await Order.findByIdAndUpdate(orderId, {
    "paymentDetails.razorpay_order_id": razorpayOrder.id,
  });

  res.status(200).json(new ApiResponse(200, razorpayOrder, "Razorpay order created successfully"));
});


// @desc    Handle Razorpay Webhook for payment verification
// @route   POST /api/v1/payments/webhook-verify
const paymentVerificationWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest === signature) {
    // Signature is valid. Payment is authentic.
    const { payload } = req.body;
    
    if (payload.payment.entity.status === 'captured') {
        const razorpay_order_id = payload.payment.entity.order_id;
        const razorpay_payment_id = payload.payment.entity.id;

        // Find our internal order and update its status
        const order = await Order.findOneAndUpdate(
          { "paymentDetails.razorpay_order_id": razorpay_order_id },
          {
            status: 'confirmed',
            "paymentDetails.razorpay_payment_id": razorpay_payment_id,
            "paymentDetails.razorpay_signature": signature,
          },
          { new: true }
        );
        
        if (order) {
            console.log(`Webhook: Payment for order ${order._id} confirmed.`);
        } else {
            console.error(`Webhook Error: Order not found for razorpay_order_id ${razorpay_order_id}`);
        }
    }
  } else {
    // Signature is invalid.
    console.error("Webhook Error: Invalid signature received.");
    throw new ApiError(400, "Invalid signature");
  }

  // Acknowledge the webhook receipt
  res.status(200).json({ status: "ok" });
});


// 🚨 THIS FUNCTION IS NOW DEPRECATED AND HANDLED BY THE WEBHOOK
const verifyPayment = asyncHandler(async (req, res) => {
    // This client-side verification is no longer the primary method.
    // The webhook is the source of truth.
    // You can keep this for fallback or remove it. For now, we'll leave it but it's unused.
    res.status(200).json(new ApiResponse(200, {}, "Verification is now handled by webhook."));
});


export { createPaymentOrder, verifyPayment, getRazorpayKey, paymentVerificationWebhook };
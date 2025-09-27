import { Router } from "express";
import {
  createPaymentOrder,
  getRazorpayKey,
  paymentVerificationWebhook,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// This new route is public because it will be called by Razorpay's servers, not a logged-in user.
router.route("/webhook-verify").post(paymentVerificationWebhook);

// All routes below require a user to be logged in
router.use(verifyJWT);

router.route("/razorpay-key").get(getRazorpayKey);
router.route("/create-order").post(createPaymentOrder);

// The client-side verify route is no longer needed with the webhook implementation
// router.route("/verify").post(verifyPayment);

export default router;
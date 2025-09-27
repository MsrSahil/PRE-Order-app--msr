import { Router } from "express";
import { createPaymentOrder, verifyPayment } from "../controllers/payment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router.route("/create-order").post(createPaymentOrder);
router.route("/verify").post(verifyPayment);

export default router;
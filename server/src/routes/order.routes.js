import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  updateOrderStatus,
  cancelOrder,
  getRestaurantOrders,
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // Isse neeche ke saare routes automatically protected ho jaayenge

router.route("/").post(placeOrder);
router.route("/my-orders").get(getMyOrders); // Naya route add karein
router.route("/:orderId/status").put(updateOrderStatus);
router.route("/:orderId/cancel").put(cancelOrder);
router.route("/restaurant/:restaurantId").get(getRestaurantOrders);

export default router;

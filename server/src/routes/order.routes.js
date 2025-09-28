import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  updateOrderStatus,
  cancelOrder,
  getRestaurantOrders,
  rejectOrder, // Import new function
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // All routes below are protected

router.route("/").post(placeOrder);
router.route("/my-orders").get(getMyOrders);
router.route("/restaurant/:restaurantId").get(getRestaurantOrders);

router.route("/:orderId/status").put(updateOrderStatus);
router.route("/:orderId/cancel").put(cancelOrder);
router.route("/:orderId/reject").put(rejectOrder); // <-- NEW ROUTE FOR REJECTION

export default router;
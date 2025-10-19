import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  updateOrderStatus,
  cancelOrder,
  getRestaurantOrders,
  rejectOrder,
  getOrderById, // Import new function
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT); // All routes below are protected

router.route("/").post(placeOrder);
router.route("/my-orders").get(getMyOrders);
router.route("/restaurant/:restaurantId").get(getRestaurantOrders);

// -- NEW ROUTE: GET SINGLE ORDER BY ID --
// Place it before other routes with similar patterns to avoid conflicts
router.route("/:orderId").get(getOrderById);

router.route("/:orderId/status").put(updateOrderStatus);
router.route("/:orderId/cancel").put(cancelOrder);
router.route("/:orderId/reject").put(rejectOrder);

export default router;
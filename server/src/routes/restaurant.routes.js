import { Router } from "express";
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateRestaurantProfile,
  toggleMenuItemAvailability,
} from "../controllers/restaurant.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js"; // Import verifyAdmin

const router = Router();

// Public Routes
router.route("/").get(getAllRestaurants);
router.route("/:id").get(getRestaurantById);

// Secured Routes (Requires Login)
router.use(verifyJWT);

// --- SECURE THIS ROUTE: Only Admins can create a restaurant now ---
router.route("/").post(verifyAdmin, createRestaurant); 

router.route("/:restaurantId/menu").post(addMenuItem);
router.route("/menu/:itemId/toggle-availability").patch(toggleMenuItemAvailability);
router.route("/menu/:itemId").put(updateMenuItem).delete(deleteMenuItem);
router.route("/:restaurantId").put(updateRestaurantProfile);

export default router;
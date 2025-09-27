import { Router } from "express";
import {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateRestaurantProfile,
} from "../controllers/restaurant.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Public Routes
router.route("/").get(getAllRestaurants);
router.route("/:id").get(getRestaurantById);

// Secured Routes (Requires Login)
router.use(verifyJWT);

router.route("/").post(createRestaurant); // Admin/Owner can create
router.route("/:restaurantId/menu").post(addMenuItem);
router.route("/menu/:itemId").put(updateMenuItem).delete(deleteMenuItem);
router.route("/:restaurantId").put(updateRestaurantProfile);
export default router;
import { Router } from "express";
import {
  registerUser,
  registerRestaurant, // Import new function
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { 
    getCurrentUser,
    updateAccountDetails,
    changeCurrentPassword
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// --- Public Routes ---
router.route("/register").post(registerUser); // For customers
router.route("/register-restaurant").post(registerRestaurant); // For restaurants
router.route("/login").post(loginUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").put(resetPassword);


// --- Secured Routes (Require Login) ---
router.use(verifyJWT);

router.route("/logout").post(logoutUser);
router.route("/me").get(getCurrentUser);
router.route("/update-account").patch(updateAccountDetails);
router.route("/change-password").post(changeCurrentPassword);

export default router;
import { Router } from "express";
import { 
    getAllUsers, 
    getAllRestaurants, 
    getDashboardStats // Import new function
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";

const router = Router();

// Yeh saare routes pehle login (verifyJWT) aur phir admin role (verifyAdmin) check karenge
router.use(verifyJWT, verifyAdmin);

router.route("/stats").get(getDashboardStats); // <-- NEW ROUTE
router.route("/users").get(getAllUsers);
router.route("/restaurants").get(getAllRestaurants);

export default router;
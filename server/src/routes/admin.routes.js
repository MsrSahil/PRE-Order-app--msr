import { Router } from "express";
import { getAllUsers, getAllRestaurants } from "../controllers/admin.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";

const router = Router();

// Yeh saare routes pehle login (verifyJWT) aur phir admin role (verifyAdmin) check karenge
router.use(verifyJWT, verifyAdmin);

router.route("/users").get(getAllUsers);
router.route("/restaurants").get(getAllRestaurants);

export default router;
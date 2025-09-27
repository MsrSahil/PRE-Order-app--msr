import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyAdmin = asyncHandler(async (req, _, next) => {
    if (req.user?.role !== "admin") {
        throw new ApiError(403, "You are not an admin to access this resource.");
    }
    next();
});
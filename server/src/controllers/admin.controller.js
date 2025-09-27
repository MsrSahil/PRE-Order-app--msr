import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Restaurant } from "../models/restaurant.model.js";

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-password");
    return res.status(200).json(new ApiResponse(200, users, "All users fetched successfully"));
});

const getAllRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find({}).populate("owner", "name email");
    return res.status(200).json(new ApiResponse(200, restaurants, "All restaurants fetched successfully"));
});

export { getAllUsers, getAllRestaurants };
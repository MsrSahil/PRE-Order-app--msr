import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Restaurant } from "../models/restaurant.model.js";
import { Order } from "../models/order.model.js"; // Import Order model

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-password");
    return res.status(200).json(new ApiResponse(200, users, "All users fetched successfully"));
});

const getAllRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find({}).populate("owner", "name email");
    return res.status(200).json(new ApiResponse(200, restaurants, "All restaurants fetched successfully"));
});

// -- NEW FUNCTION: GET DASHBOARD STATISTICS --
const getDashboardStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const totalOrders = await Order.countDocuments();

    // You can add more stats here, like total revenue
    // const revenue = await Order.aggregate([...]);

    const stats = {
        totalUsers,
        totalRestaurants,
        totalOrders
    };

    return res.status(200).json(new ApiResponse(200, stats, "Dashboard stats fetched successfully"));
});


export { getAllUsers, getAllRestaurants, getDashboardStats }; // Add new function to export
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Restaurant } from "../models/restaurant.model.js";
import { mailSender } from "../utils/mailSender.js";
import crypto from "crypto";

const generateAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    return accessToken;
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }
  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(409, "User with this email already exists");
  }
  const user = await User.create({ name, email, password, phone, role: 'customer' });
  const createdUser = await User.findById(user._id).select("-password");
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// In server/src/controllers/auth.controller.js

const registerRestaurant = asyncHandler(async (req, res) => {
    const { ownerName, email, password, phone, restaurantName, address, imageUrl } = req.body;

    const requiredFields = { ownerName, email, password, restaurantName, address, imageUrl };
    for (const [key, value] of Object.entries(requiredFields)) {
        if (!value || typeof value !== 'string' || value.trim() === "") {
            throw new ApiError(400, `${key} is required and must be a non-empty string`);
        }
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "An account with this email already exists.");
    }

    const owner = await User.create({ name: ownerName, email, password, phone, role: 'restaurant' });
    if (!owner) {
        throw new ApiError(500, "Failed to create the restaurant owner account.");
    }

    // --- BUG FIX: Explicitly add default operating hours during creation ---
    const restaurant = await Restaurant.create({ 
        name: restaurantName, 
        address, 
        imageUrl, 
        owner: owner._id,
        operatingHours: {
            open: "09:00", // Default opening time
            close: "22:00"  // Default closing time
        }
    });
    // --- END OF FIX ---

    if (!restaurant) {
        await User.findByIdAndDelete(owner._id);
        throw new ApiError(500, "Failed to create the restaurant profile.");
    }
    
    await User.findByIdAndUpdate(owner._id, {
        $set: { restaurant: restaurant._id }
    });

    return res.status(201).json(new ApiResponse(201, { restaurant }, "Restaurant registered successfully! Please login."));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  const user = await User.findOne({ email }).populate('restaurant', '_id');
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  const accessToken = await generateAccessToken(user._id);
  const loggedInUser = await User.findById(user._id).select("-password");
  const options = { httpOnly: true, secure: process.env.NODE_ENV === "production" };
  return res.status(200).cookie("accessToken", accessToken, options).json(
      new ApiResponse(200, { user: { ...loggedInUser.toObject(), restaurantId: user.restaurant?._id || null }, accessToken }, "User logged in successfully")
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const options = { httpOnly: true, secure: true };
  return res.status(200).clearCookie("accessToken", options).json(new ApiResponse(200, {}, "User logged out successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(200).json(new ApiResponse(200, {}, "Password reset link has been sent to your email."));
  }
  const resetToken = user.getForgotPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const message = `Click this link to reset your password within 15 minutes:\n\n${resetUrl}`;
  try {
    await mailSender(user.email, "Pre-Order App - Password Reset", message);
    res.status(200).json(new ApiResponse(200, {}, "Password reset link has been sent to your email."));
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, "Failed to send password reset email. Please try again.");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  if (!password || !token) throw new ApiError(400, "Missing password or token");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });
  if (!user) throw new ApiError(400, "Invalid or expired password reset token.");
  user.password = password;
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  await user.save();
  res.status(200).json(new ApiResponse(200, {}, "Password has been reset successfully."));
});

export { registerUser, registerRestaurant, loginUser, logoutUser, forgotPassword, resetPassword };
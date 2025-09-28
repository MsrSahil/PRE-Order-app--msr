import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

// -- NEW FUNCTION: UPDATE ACCOUNT DETAILS --
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, phone } = req.body;

    if (!name && !phone) {
        throw new ApiError(400, "Please provide a name or phone number to update.");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                // Only update fields that are provided
                ...(name && { name }),
                ...(phone && { phone }),
            }
        },
        { new: true } // Return the updated document
    ).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});


// -- NEW FUNCTION: CHANGE PASSWORD --
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old and new passwords are required.");
    }

    // Find the user from the database, because req.user doesn't have the password field
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old password.");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: true }); // Mongoose pre-save hook will hash the password

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});


export { getCurrentUser, updateAccountDetails, changeCurrentPassword };
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Restaurant } from "../models/restaurant.model.js";
import { MenuItem } from "../models/menuItem.model.js";
import { User } from "../models/user.model.js";


// @desc    Create a new restaurant (Admin only)
// @route   POST /api/v1/restaurants
const createRestaurant = asyncHandler(async (req, res) => {
  const { name, address, imageUrl } = req.body;
  if (!name || !address || !imageUrl) {
    throw new ApiError(400, "All fields are required");
  }
  const restaurant = await Restaurant.create({ name, address, imageUrl, owner: req.user._id });
  
  await User.findByIdAndUpdate(req.user._id, {
    role: 'restaurant',
    restaurant: restaurant._id
  });

  return res.status(201).json(new ApiResponse(201, restaurant, "Restaurant created successfully"));
});

// @desc    Get all restaurants
// @route   GET /api/v1/restaurants
const getAllRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({});
  return res.status(200).json(new ApiResponse(200, restaurants, "Restaurants fetched successfully"));
});

// @desc    Get single restaurant by ID with its menu
// @route   GET /api/v1/restaurants/:id
const getRestaurantById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }
  const menu = await MenuItem.find({ restaurant: id, isAvailable: true });
  const data = { restaurant, menu };
  return res.status(200).json(new ApiResponse(200, data, "Restaurant data fetched successfully"));
});

// @desc    Add a menu item to a restaurant
// @route   POST /api/v1/restaurants/:restaurantId/menu
const addMenuItem = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }

    if (restaurant.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to add menu items to this restaurant");
    }
    
    const { name, description, price, category, imageUrl } = req.body;
    if(!name || !price) {
        throw new ApiError(400, "Name and price are required");
    }
    const menuItem = await MenuItem.create({
        name, description, price, category, imageUrl, restaurant: restaurantId
    });
    return res.status(201).json(new ApiResponse(201, menuItem, "Menu item added successfully"));
});

// @desc    Update a menu item
// @route   PUT /api/v1/restaurants/menu/:itemId
const updateMenuItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const menuItem = await MenuItem.findById(itemId).populate('restaurant');

    if (!menuItem) {
        throw new ApiError(404, "Menu item not found");
    }

    if (menuItem.restaurant.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this menu item");
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(itemId, req.body, { new: true });
    
    return res.status(200).json(new ApiResponse(200, updatedItem, "Menu item updated successfully"));
});

// @desc    Delete a menu item
// @route   DELETE /api/v1/restaurants/menu/:itemId
const deleteMenuItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const menuItem = await MenuItem.findById(itemId).populate('restaurant');

    if (!menuItem) {
        throw new ApiError(404, "Menu item not found");
    }

    if (menuItem.restaurant.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this menu item");
    }
    
    await MenuItem.findByIdAndDelete(itemId);
    return res.status(200).json(new ApiResponse(200, {}, "Menu item deleted successfully"));
});

// In server/src/controllers/restaurant.controller.js

const updateRestaurantProfile = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const { name, address, imageUrl } = req.body; // Add imageUrl here

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
        throw new ApiError(404, "Restaurant not found");
    }
    
    if (restaurant.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this restaurant's profile");
    }

    restaurant.name = name || restaurant.name;
    restaurant.address = address || restaurant.address;
    restaurant.imageUrl = imageUrl || restaurant.imageUrl; // Add this line
    
    await restaurant.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, restaurant, "Restaurant profile updated successfully"));
});
// -- NEW FUNCTION: TOGGLE MENU ITEM AVAILABILITY --
const toggleMenuItemAvailability = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const menuItem = await MenuItem.findById(itemId).populate('restaurant');

    if (!menuItem) {
        throw new ApiError(404, "Menu item not found");
    }

    // Authorize that the user owns the restaurant this menu item belongs to
    if (menuItem.restaurant.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to modify this menu item");
    }

    // Toggle the availability status
    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, menuItem, "Menu item availability updated successfully"));
});


// -- UPDATE THE EXPORT STATEMENT AT THE BOTTOM OF THE FILE --
export {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateRestaurantProfile,
  toggleMenuItemAvailability // Add the new function here
};
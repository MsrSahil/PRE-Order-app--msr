import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { MenuItem } from "../models/menuItem.model.js";
import { Restaurant } from "../models/restaurant.model.js";

const placeOrder = asyncHandler(async (req, res) => {
  const { cartItems, totalAmount, eta } = req.body;
  const user = req.user;

  if (!cartItems || cartItems.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  if (!eta) {
    throw new ApiError(400, "ETA is required");
  }

  const menuItemIds = cartItems.map(item => item._id);
  const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

  if (menuItems.length !== cartItems.length) {
    throw new ApiError(404, "One or more menu items not found");
  }

  const restaurantId = menuItems[0].restaurant;
  for (const item of menuItems) {
    if (item.restaurant.toString() !== restaurantId.toString()) {
      throw new ApiError(400, "All items in the cart must be from the same restaurant");
    }
  }

  const orderItems = cartItems.map((item) => ({
    menuItem: item._id,
    quantity: item.quantity,
    price: item.price,
  }));

  const order = await Order.create({
    user: user._id,
    items: orderItems,
    totalAmount,
    restaurant: restaurantId,
    eta,
    status: "pending",
  });

  if (!order) {
    throw new ApiError(500, "Failed to place order");
  }
  
  const populatedOrder = await order
    .populate("user", "name")
    .populate("items.menuItem", "name");
  req.io.to(restaurantId.toString()).emit("newOrder", populatedOrder);
  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order placed successfully"));
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("restaurant", "name")
    .sort({ createdAt: -1 });

  if (!orders) {
    throw new ApiError(404, "No orders found for this user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  
  const restaurant = await Restaurant.findById(order.restaurant);
  if (restaurant.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to update this order's status");
  }

  order.status = status;
  await order.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated"));
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to cancel this order");
  }

  if (["completed", "cancelled"].includes(order.status)) {
    throw new ApiError(
      400,
      `Cannot cancel an order that is already ${order.status}`
    );
  }

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (order.createdAt < fiveMinutesAgo) {
    throw new ApiError(
      400,
      "Order can only be cancelled within 5 minutes of placement"
    );
  }

  order.status = "cancelled";
  await order.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order cancelled successfully"));
});

export { placeOrder, getMyOrders, updateOrderStatus, cancelOrder };
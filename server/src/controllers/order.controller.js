import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { MenuItem } from "../models/menuItem.model.js";

const placeOrder = asyncHandler(async (req, res) => {
  const { cartItems, totalAmount, eta } = req.body;
  const user = req.user; // Yeh auth.middleware se aa raha hai

  if (!cartItems || cartItems.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  if (!eta) {
    throw new ApiError(400, "ETA is required");
  }

  // Assume all items in the cart are from the same restaurant
  const firstItemId = cartItems[0]._id;
  const menuItem = await MenuItem.findById(firstItemId);
  if (!menuItem) {
    throw new ApiError(404, "Menu item not found");
  }
  const restaurantId = menuItem.restaurant;

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
    status: "pending", // Ideally, this should be 'pending' until payment is confirmed
  });

  if (!order) {
    throw new ApiError(500, "Failed to place order");
  }

  // Emit a real-time event to the specific restaurant's room
  const populatedOrder = await order
    .populate("user", "name")
    .populate("items.menuItem", "name"); // Isse update karein
  req.io.to(restaurantId.toString()).emit("newOrder", populatedOrder);
  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order placed successfully"));
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("restaurant", "name") // Populate restaurant name
    .sort({ createdAt: -1 }); // Show newest orders first

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

  // In a real app, you should add authorization here to ensure
  // only the owner of the restaurant can change the status.

  order.status = status;
  await order.save({ validateBeforeSave: false });

  // You could also emit an event to the user here to notify them of the status update
  // req.io.to(order.user.toString()).emit('orderStatusUpdate', order);

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

  // Check if the user canceling the order is the one who placed it
  if (order.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to cancel this order");
  }

  // Check if the order is already in a final state
  if (["completed", "cancelled"].includes(order.status)) {
    throw new ApiError(
      400,
      `Cannot cancel an order that is already ${order.status}`
    );
  }

  // Check if the order was placed within the last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (order.createdAt < fiveMinutesAgo) {
    throw new ApiError(
      400,
      "Order can only be cancelled within 5 minutes of placement"
    );
  }

  order.status = "cancelled";
  await order.save({ validateBeforeSave: false });

  // Yahan hum refund ka logic trigger kar sakte hain

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order cancelled successfully"));
});

export { placeOrder, getMyOrders, updateOrderStatus, cancelOrder }; // Naya function export karein

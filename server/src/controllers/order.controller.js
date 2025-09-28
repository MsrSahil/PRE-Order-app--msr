import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { MenuItem } from "../models/menuItem.model.js";
import { Restaurant } from "../models/restaurant.model.js";

// In server/src/controllers/order.controller.js

const placeOrder = asyncHandler(async (req, res) => {
  const { cartItems, totalAmount, eta } = req.body;
  const user = req.user;

  if (!cartItems || cartItems.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  if (!eta) {
    throw new ApiError(400, "ETA is required");
  }

  const menuItemIds = cartItems.map((item) => item._id);
  const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

  if (menuItems.length !== cartItems.length) {
    throw new ApiError(404, "One or more menu items not found");
  }

  const restaurantId = menuItems[0].restaurant;
  for (const item of menuItems) {
    if (item.restaurant.toString() !== restaurantId.toString()) {
      throw new ApiError(
        400,
        "All items in the cart must be from the same restaurant"
      );
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
    status: "pending", // Order starts as pending
  });

  if (!order) {
    throw new ApiError(500, "Failed to place order");
  }

  // IMPORTANT: Populate and emit the new order to the dashboard IMMEDIATELY
  const populatedOrder = await order
    .populate("user", "name")
    .populate("items.menuItem", "name");
    
  req.io.to(restaurantId.toString()).emit("newOrder", populatedOrder);

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order created successfully and pending payment"));
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

  // EMIT a real-time update to the dashboard
  const populatedOrder = await order.populate("user", "name").populate("items.menuItem", "name");
  req.io.to(order.restaurant.toString()).emit("orderStatusUpdate", populatedOrder);

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

// Add this new function in the controller file

const getRestaurantOrders = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;

    // Optional: Add filtering for only "active" statuses
    const activeStatuses = ["pending", "confirmed", "preparing", "ready_for_pickup"];

    const orders = await Order.find({ 
        restaurant: restaurantId,
        status: { $in: activeStatuses }
    })
    .populate("user", "name")
    .populate("items.menuItem", "name")
    .sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, orders, "Restaurant orders fetched successfully"));
});
const rejectOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('restaurant');

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Authorize that the user owns the restaurant
    if (order.restaurant.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to reject this order");
    }

    // A restaurant should only be able to reject an order that is 'pending' or 'confirmed'
    if (order.status !== 'pending' && order.status !== 'confirmed') {
        throw new ApiError(400, `Cannot reject an order with status: ${order.status}`);
    }
    
    // Initiate refund process (simulation)
    // In a real application, you would call the payment gateway's refund API here.
    console.log(`--- SIMULATING REFUND ---`);
    console.log(`Initiating refund for Razorpay Payment ID: ${order.paymentDetails?.razorpay_payment_id}`);
    console.log(`Amount: ₹${order.totalAmount}`);
    console.log(`-----------------------`);
    
    // Update the order status to 'cancelled'
    order.status = 'cancelled';
    await order.save({ validateBeforeSave: false });

    // Emit a real-time update to the dashboard
    const populatedOrder = await order.populate("user", "name").populate("items.menuItem", "name");
    req.io.to(order.restaurant._id.toString()).emit("orderStatusUpdate", populatedOrder);
    
    // TODO: Send a notification to the user that their order was rejected.

    return res.status(200).json(new ApiResponse(200, populatedOrder, "Order has been rejected and refund initiated."));
});


// -- UPDATE THE EXPORT STATEMENT AT THE BOTTOM OF THE FILE --
export {
  placeOrder,
  getMyOrders,
  updateOrderStatus,
  cancelOrder,
  getRestaurantOrders,
  rejectOrder // Add the new function here
};
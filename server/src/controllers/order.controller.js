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

  const firstMenuItem = await MenuItem.findById(cartItems[0]._id);
  if (!firstMenuItem) {
    throw new ApiError(404, "Menu item not found");
  }

  const restaurant = await Restaurant.findById(firstMenuItem.restaurant);
  if (!restaurant) {
    throw new ApiError(404, "Restaurant not found");
  }

  if (restaurant.operatingHours && restaurant.operatingHours.open && restaurant.operatingHours.close) {
    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    const { open, close } = restaurant.operatingHours;
    if (currentTime < open || currentTime > close) {
      throw new ApiError(400, `Sorry, the restaurant is closed. Open from ${open} to ${close}.`);
    }
  }

  const menuItemIds = cartItems.map((item) => item._id);
  const menuItemsFromDB = await MenuItem.find({ _id: { $in: menuItemIds } });

  if (menuItemsFromDB.length !== cartItems.length) {
    throw new ApiError(404, "One or more menu items in the cart are no longer available.");
  }

  const restaurantId = menuItemsFromDB[0].restaurant;
  for (const item of menuItemsFromDB) {
    if (item.restaurant.toString() !== restaurantId.toString()) {
      throw new ApiError(400, "All items in the cart must be from the same restaurant.");
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
    throw new ApiError(500, "Something went wrong while creating the order.");
  }

  // --- BUG FIX: Correct way to populate nested fields ---
  const populatedOrder = await Order.findById(order._id)
    .populate("user", "name")
    .populate({
        path: 'items',
        populate: {
            path: 'menuItem',
            model: 'MenuItem',
            select: 'name'
        }
    });

  req.io.to(restaurantId.toString()).emit("newOrder", populatedOrder.toObject());
  
  return res.status(201).json(new ApiResponse(201, order, "Order created successfully and pending payment"));
});


// --- Baaki ke saare functions waise hi rahenge ---

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("restaurant", "name")
    .populate({
        path: 'items',
        populate: {
            path: 'menuItem',
            model: 'MenuItem',
            select: 'name'
        }
    })
    .sort({ createdAt: -1 });

  if (!orders) {
    throw new ApiError(404, "No orders found for this user");
  }

  return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

const getRestaurantOrders = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const activeStatuses = ["pending", "confirmed", "preparing", "ready_for_pickup"];
    const orders = await Order.find({ restaurant: restaurantId, status: { $in: activeStatuses }})
    .populate("user", "name")
    .populate({
        path: 'items',
        populate: {
            path: 'menuItem',
            model: 'MenuItem',
            select: 'name'
        }
    })
    .sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(200, orders, "Restaurant orders fetched successfully"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");
  const restaurant = await Restaurant.findById(order.restaurant);
  if (restaurant.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to update this order's status");
  }
  order.status = status;
  await order.save({ validateBeforeSave: false });
  const populatedOrder = await Order.findById(order._id).populate("user", "name").populate({ path: 'items', populate: { path: 'menuItem', model: 'MenuItem', select: 'name' }});
  req.io.to(order.restaurant.toString()).emit("orderStatusUpdate", populatedOrder.toObject());
  return res.status(200).json(new ApiResponse(200, order, "Order status updated"));
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user._id;
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");
  if (order.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to cancel this order");
  }
  if (["completed", "cancelled"].includes(order.status)) {
    throw new ApiError(400, `Cannot cancel an order that is already ${order.status}`);
  }
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  if (order.createdAt < fiveMinutesAgo) {
    throw new ApiError(400, "Order can only be cancelled within 5 minutes of placement");
  }
  order.status = "cancelled";
  await order.save({ validateBeforeSave: false });
  return res.status(200).json(new ApiResponse(200, order, "Order cancelled successfully"));
});

const rejectOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('restaurant');
    if (!order) throw new ApiError(404, "Order not found");
    if (order.restaurant.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to reject this order");
    }
    if (order.status !== 'pending' && order.status !== 'confirmed') {
        throw new ApiError(400, `Cannot reject an order with status: ${order.status}`);
    }
    console.log(`--- SIMULATING REFUND ---`);
    console.log(`Initiating refund for Razorpay Payment ID: ${order.paymentDetails?.razorpay_payment_id}`);
    console.log(`Amount: ₹${order.totalAmount}`);
    console.log(`-----------------------`);
    order.status = 'cancelled';
    await order.save({ validateBeforeSave: false });
    const populatedOrder = await Order.findById(order._id).populate("user", "name").populate({ path: 'items', populate: { path: 'menuItem', model: 'MenuItem', select: 'name' }});
    req.io.to(order.restaurant._id.toString()).emit("orderStatusUpdate", populatedOrder.toObject());
    return res.status(200).json(new ApiResponse(200, populatedOrder, "Order has been rejected and refund initiated."));
});

const getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
        .populate("restaurant", "name address")
        .populate({
            path: 'items',
            populate: {
                path: 'menuItem',
                model: 'MenuItem',
                select: 'name'
            }
        });
    if (!order) throw new ApiError(404, "Order not found");
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        throw new ApiError(403, "You are not authorized to view this order");
    }
    return res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

export {
  placeOrder,
  getMyOrders,
  updateOrderStatus,
  cancelOrder,
  getRestaurantOrders,
  rejectOrder,
  getOrderById
};
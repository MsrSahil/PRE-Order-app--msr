import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        menuItem: {
          type: Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready_for_pickup",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    paymentDetails: {
      type: Object,
      default: {},
    },
    eta: {
      type: String, // Jaise "30 minutes", "1 hour"
      required: true,
    },
    // Hum baad mein payment details bhi yahan add kar sakte hain
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);

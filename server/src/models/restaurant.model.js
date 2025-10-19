import mongoose, { Schema } from "mongoose";

const restaurantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // -- NEW: OPERATING HOURS --
    operatingHours: {
      open: {
        type: String, // e.g., "10:00"
        default: "09:00",
      },
      close: {
        type: String, // e.g., "22:00"
        default: "22:00",
      },
    },
  },
  { timestamps: true }
);

export const Restaurant = mongoose.model("Restaurant", restaurantSchema);
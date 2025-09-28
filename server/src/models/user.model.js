import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // Import the crypto module

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["customer", "restaurant", "admin"],
      default: "customer",
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
    // -- NEW FIELDS FOR PASSWORD RESET --
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRY,
    }
  );
};

// -- NEW METHOD TO GENERATE RESET TOKEN --
userSchema.methods.getForgotPasswordToken = function () {
  // 1. Generate a random token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // 2. Hash the token and save it to the database
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 3. Set an expiry time (e.g., 15 minutes)
  this.forgotPasswordExpiry = Date.now() + 15 * 60 * 1000;

  // 4. Return the unhashed token to be sent via email
  return resetToken;
};


export const User = mongoose.model("User", userSchema);
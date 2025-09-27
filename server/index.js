import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { ApiError } from "./src/utils/ApiError.js";
import { Server } from "socket.io";
import http from "http";

dotenv.config({
  path: "./.env",
});

const app = express();
const server = http.createServer(app); // Express app se ek HTTP server banayein

const io = new Server(server, { // Socket.io ko HTTP server se attach karein
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(morgan("dev"));
app.use(cookieParser());

// Socket.io connection logic
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinRestaurantRoom", (restaurantId) => {
    socket.join(restaurantId);
    console.log(`Socket ${socket.id} joined room ${restaurantId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


// Routes import
import userRouter from "./src/routes/user.routes.js";
import restaurantRouter from "./src/routes/restaurant.routes.js";
import orderRouter from "./src/routes/order.routes.js";
import paymentRouter from "./src/routes/payment.routes.js";
import adminRouter from "./src/routes/admin.routes.js";





// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/restaurants", restaurantRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/admin", adminRouter);




// Global Error Handler
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
    });
  }
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

// App ko request ke saath socket instance pass karne ke liye middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});


connectDB()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => { // app.listen ki jagah server.listen
      console.log(`🚀 Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
  });
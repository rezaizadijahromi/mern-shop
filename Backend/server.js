import express from "express";
import path from "path";
import dotenv from "dotenv";
import colors from "colors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import userRoute from "./routes/userRoutes.js";
import productRoute from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorMiddleWare.js";

dotenv.config();

connectDB();

const app = express();
app.use(express.json());

// morgan for production
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// MiddleWares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold,
  ),
);

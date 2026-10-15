import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import productRoutes from "./routes/product.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";  // Lab 4
import cartRoutes from "./routes/cart.routes.js";          // Lab 5
import orderRoutes from "./routes/order.routes.js";        // Lab 6

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/products", productRoutes);
app.use("/customers", customerRoutes);
app.use("/wishlist", wishlistRoutes);   // Lab 4
app.use("/cart", cartRoutes);           // Lab 5
app.use("/orders", orderRoutes);        // Lab 6

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
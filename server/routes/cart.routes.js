import express from "express";
import {
    addToCart,
    getCart,
    updateCartItem,
    removeFromCart,
} from "../controllers/cart.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// All cart routes are protected
router.post("/:productId", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);
router.patch("/:productId", authMiddleware, updateCartItem);
router.delete("/:productId", authMiddleware, removeFromCart);

export default router;

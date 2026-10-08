import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// POST /cart/:productId  — Add product to cart (or increase quantity by 1)
export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const user = await Customer.findById(req.user._id);
        const existingItem = user.cart.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            if (existingItem.quantity + 1 > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} units available`,
                });
            }
            existingItem.quantity += 1;
        } else {
            if (product.stock < 1) {
                return res.status(400).json({ success: false, message: "Product is out of stock" });
            }
            user.cart.push({ product: productId, quantity: 1 });
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Cart updated",
            cart: user.cart,
        });
    } catch (error) {
        console.error("Add to cart error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// GET /cart  — Get authenticated user's cart with populated product data
export const getCart = async (req, res) => {
    try {
        const user = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price image stock category",
        });

        return res.status(200).json({
            success: true,
            cart: user.cart,
        });
    } catch (error) {
        console.error("Get cart error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// PATCH /cart/:productId  — Update quantity of a cart item
export const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} units available`,
            });
        }

        const user = await Customer.findById(req.user._id);
        const item = user.cart.find((i) => i.product.toString() === productId);

        if (!item) {
            return res.status(404).json({ success: false, message: "Item not in cart" });
        }

        item.quantity = quantity;
        await user.save();

        return res.status(200).json({ success: true, message: "Cart updated", cart: user.cart });
    } catch (error) {
        console.error("Update cart error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// DELETE /cart/:productId  — Remove a product from cart
export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ success: false, message: "Invalid product ID" });
        }

        const user = await Customer.findById(req.user._id);
        const inCart = user.cart.some((i) => i.product.toString() === productId);

        if (!inCart) {
            return res.status(404).json({ success: false, message: "Item not in cart" });
        }

        user.cart = user.cart.filter((i) => i.product.toString() !== productId);
        await user.save();

        return res.status(200).json({ success: true, message: "Item removed from cart" });
    } catch (error) {
        console.error("Remove from cart error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// POST /wishlist/:productId
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const user = req.user;

        const alreadyWishlisted = user.wishlist.some(
            (id) => id.toString() === productId
        );

        if (alreadyWishlisted) {
            return res.status(409).json({
                success: false,
                message: "Product already in wishlist",
            });
        }

        user.wishlist.push(productId);
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Product added to wishlist",
        });
    } catch (error) {
        console.error("Add to wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// GET /wishlist
export const getWishlist = async (req, res) => {
    try {
        const user = await Customer.findById(req.user._id).populate({
            path: "wishlist",
            select: "name price category image stock",
        });

        return res.status(200).json({
            success: true,
            count: user.wishlist.length,
            wishlist: user.wishlist,
        });
    } catch (error) {
        console.error("Get wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

// DELETE /wishlist/:productId
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }

        const user = req.user;

        const inWishlist = user.wishlist.some(
            (id) => id.toString() === productId
        );

        if (!inWishlist) {
            return res.status(404).json({
                success: false,
                message: "Product not in wishlist",
            });
        }

        user.wishlist = user.wishlist.filter(
            (id) => id.toString() !== productId
        );
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from wishlist",
        });
    } catch (error) {
        console.error("Remove from wishlist error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

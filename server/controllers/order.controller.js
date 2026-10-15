import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /orders/create-payment-order
export const createPaymentOrder = async (req, res) => {
    try {
        const { shippingAddress } = req.body;

        // Basic address validation
        const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress || {};
        if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
            return res.status(400).json({ success: false, message: "All shipping address fields are required" });
        }

        // Load user with populated cart
        const user = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price image stock",
        });

        if (!user.cart || user.cart.length === 0) {
            return res.status(400).json({ success: false, message: "Your cart is empty" });
        }

        // Validate stock and build order items snapshot
        let totalAmount = 0;
        const orderItems = [];

        for (const item of user.cart) {
            const product = await Product.findById(item.product._id);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product ${item.product.name} no longer exists`,
                });
            }
            if (item.quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Only ${product.stock} left.`,
                });
            }

            // Snapshot current price
            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.image,
            });
        }

        // Create a pending ShopKart order
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT",
        });

        // Create Razorpay order (amount in paise)
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: order._id.toString(),
        });

        // Save razorpayOrderId to our order
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(201).json({
            success: true,
            orderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error("Create payment order error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// POST /orders/verify-payment
export const verifyPayment = async (req, res) => {
    try {
        const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        // Verify HMAC SHA256 signature
        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        // Mark order as PAID and PLACED
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpayPaymentId;
        await order.save();

        // Deduct stock for each product in the order
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        // Clear user cart
        await Customer.findByIdAndUpdate(req.user._id, { cart: [] });

        return res.status(200).json({
            success: true,
            message: "Payment verified. Order placed successfully!",
            order,
        });
    } catch (error) {
        console.error("Verify payment error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// GET /orders  — Get current user's orders
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

        return res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error("Get orders error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// GET /orders/:id  — Get a single order
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid order ID" });
        }

        const order = await Order.findOne({ _id: id, user: req.user._id });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.error("Get order error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

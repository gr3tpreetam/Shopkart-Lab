import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
        },

        phone: {
            type: Number,
            required: true,
        },

        // Lab 4 — Wishlist: stores Product ObjectId references
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],

        // Lab 5 — Cart: stores product reference + quantity
        cart: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1,
                },
            },
        ],
    },
    {
        timestamps: { createdAt: true, updatedAt: false }
    }
);

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;
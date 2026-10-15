import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";

dotenv.config();

const products = [
  {
    name: "Noise Cancelling Headphones",
    description: "Wireless over-ear headphones with active noise cancellation. Premium sound quality with 30-hour battery life.",
    price: 4999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
    stock: 25,
  },
  {
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with blue switches. Full-size layout with dedicated media keys.",
    price: 2999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500",
    stock: 10,
  },
  {
    name: "Wireless Mouse",
    description: "Ergonomic wireless mouse with adjustable DPI up to 16000. Silent clicks and long battery life.",
    price: 1499,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500",
    stock: 40,
  },
  {
    name: "Smart Watch",
    description: "Fitness tracker with heart rate monitor, GPS, and 7-day battery life. Water resistant up to 50m.",
    price: 7999,
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    stock: 15,
  },
  {
    name: "Cotton T-Shirt",
    description: "Premium 100% cotton crew neck t-shirt. Comfortable fit with reinforced stitching.",
    price: 599,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    stock: 100,
  },
  {
    name: "Denim Jacket",
    description: "Classic denim jacket with button closure. Vintage wash with multiple pockets.",
    price: 2499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
    stock: 30,
  },
  {
    name: "Running Shoes",
    description: "Lightweight running shoes with cushioned sole. Breathable mesh upper for maximum comfort.",
    price: 3499,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
    stock: 50,
  },
  {
    name: "JavaScript: The Good Parts",
    description: "A deep dive into the best features of JavaScript by Douglas Crockford. Essential for every developer.",
    price: 450,
    category: "Books",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500",
    stock: 60,
  },
  {
    name: "Clean Code",
    description: "A handbook of agile software craftsmanship by Robert C. Martin. Learn to write better code.",
    price: 699,
    category: "Books",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500",
    stock: 35,
  },
  {
    name: "Table Lamp",
    description: "Modern minimalist LED desk lamp with adjustable brightness. Touch control with USB charging port.",
    price: 1299,
    category: "Home",
    image: "https://images.unsplash.com/photo-1513506003901-1e6a229e9d15?w=500",
    stock: 20,
  },
  {
    name: "Ceramic Coffee Mug",
    description: "Handcrafted ceramic coffee mug with matte finish. Holds 350ml and is microwave safe.",
    price: 399,
    category: "Home",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500",
    stock: 80,
  },
  {
    name: "Backpack",
    description: "Water-resistant laptop backpack with multiple compartments. Fits up to 15.6 inch laptops.",
    price: 1899,
    category: "Fashion",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
    stock: 45,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert new products
    await Product.insertMany(products);
    console.log("Seeded " + products.length + " products successfully!");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();

import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";

dotenv.config();

async function fixImage() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Using a different working unsplash image of a lamp
    const newImageUrl = "https://images.unsplash.com/photo-1513506003901-1e6a229e9d15?w=500";
    
    await Product.updateOne(
      { name: "Table Lamp" },
      { $set: { image: newImageUrl } }
    );
    
    console.log("Fixed Table Lamp image!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixImage();

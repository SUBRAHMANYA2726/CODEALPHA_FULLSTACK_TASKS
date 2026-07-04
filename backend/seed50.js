import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js';

dotenv.config();

connectDB();

const seedProducts = async () => {
  try {
    // Delete all existing products to start fresh
    await Product.deleteMany();
    console.log('Existing products cleared');

    let adminUser = await User.findOne({ isAdmin: true });
    if (!adminUser) {
      console.log('No admin user found. Creating a default admin user...');
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        isAdmin: true,
      });
    }

    // Fetch 50 products from a public API
    console.log('Fetching 50 products...');
    const response = await fetch('https://dummyjson.com/products?limit=50');
    const data = await response.json();
    
    const formattedProducts = data.products.map((p) => {
      return {
        user: adminUser._id,
        name: p.title,
        image: p.thumbnail, // or p.images[0]
        brand: p.brand || 'Generic',
        category: p.category,
        description: p.description,
        rating: p.rating || 4.5,
        numReviews: Math.floor(Math.random() * 100),
        price: p.price,
        countInStock: p.stock > 0 ? p.stock : 10,
      };
    });

    await Product.insertMany(formattedProducts);
    console.log('50 Products Successfully Seeded!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedProducts();

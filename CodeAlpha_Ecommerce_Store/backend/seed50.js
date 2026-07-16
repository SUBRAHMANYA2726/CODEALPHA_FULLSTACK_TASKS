import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js';

dotenv.config();

connectDB();

const aetherArcadeProducts = [
  {
    name: 'Aether Nexus Pro Headset',
    image: 'https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/ea74bc283_generated_8bcbde2b.png',
    brand: 'Aether',
    category: 'Pro Audio',
    description: 'Immerse yourself in cinematic audio with the Aether Nexus Pro. Features active noise cancellation, spatial audio, and premium memory foam cups.',
    rating: 4.8,
    numReviews: 124,
    price: 299.99,
    countInStock: 15,
  },
  {
    name: 'Obsidian Mechanical Keyboard',
    image: 'https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/7f9d09073_generated_29c20e76.png',
    brand: 'Aether',
    category: 'Keyboards',
    description: 'Crafted from aircraft-grade aluminum, the Obsidian features custom tactile switches and per-key RGB lighting.',
    rating: 4.9,
    numReviews: 89,
    price: 189.99,
    countInStock: 8,
  },
  {
    name: 'Pulse Wireless Mouse',
    image: 'https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/3394bcc60_generated_1a265a13.png',
    brand: 'Aether',
    category: 'Mice',
    description: 'Ultra-lightweight wireless gaming mouse with a 26K DPI sensor and 80 hours of battery life.',
    rating: 4.7,
    numReviews: 256,
    price: 129.99,
    countInStock: 22,
  },
  {
    name: 'Aether Display Pro X',
    image: 'https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/307f76e75_generated_dfa087e2.png',
    brand: 'Aether',
    category: 'Monitors',
    description: '27-inch OLED 240Hz gaming monitor. Experience true blacks and incredibly vibrant colors.',
    rating: 5.0,
    numReviews: 42,
    price: 899.99,
    countInStock: 5,
  },
  {
    name: 'Nova Pro Controller',
    image: 'https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/13b1a008e_generated_463e3cf8.png',
    brand: 'Aether',
    category: 'Controllers',
    description: 'Pro-level custom controller with interchangeable thumbsticks and rear paddles.',
    rating: 4.6,
    numReviews: 112,
    price: 149.99,
    countInStock: 18,
  },
  {
    name: 'Quantum Streaming Mic',
    image: 'https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/228d87795_generated_f4c202cc.png',
    brand: 'Aether',
    category: 'Pro Audio',
    description: 'Studio-quality condenser microphone for flawless voice capture during streams and calls.',
    rating: 4.8,
    numReviews: 78,
    price: 179.99,
    countInStock: 12,
  },
  {
    name: 'Aether Core Desktop PC',
    image: 'https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/84501e12f_generated_fbfbfe76.png',
    brand: 'Aether',
    category: 'Systems',
    description: 'The ultimate monolithic gaming powerhouse. RTX 4090, Intel i9, liquid cooled.',
    rating: 4.9,
    numReviews: 15,
    price: 3499.99,
    countInStock: 3,
  },
  {
    name: 'Luminary Ambient Light Strip',
    image: 'https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/5ce2785b5_generated_a29f5f5a.png',
    brand: 'Aether',
    category: 'Accessories',
    description: 'Smart ambient lighting that syncs with your gameplay for true immersion.',
    rating: 4.5,
    numReviews: 312,
    price: 59.99,
    countInStock: 45,
  }
];

const seedData = async () => {
  try {
    // Delete all existing data
    await Product.deleteMany();
    await User.deleteMany();
    console.log('Database cleared');

    // Create Admin User
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      isAdmin: true,
    });

    // Create Standard User
    await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      isAdmin: false,
    });
    
    console.log('Users seeded successfully');

    const formattedProducts = aetherArcadeProducts.map(p => ({
      ...p,
      user: adminUser._id
    }));

    await Product.insertMany(formattedProducts);
    console.log('Aether Arcade Products successfully seeded!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();

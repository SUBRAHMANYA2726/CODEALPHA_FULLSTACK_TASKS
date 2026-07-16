import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const images = [
  'https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/ea74bc283_generated_8bcbde2b.png',
  'https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/7f9d09073_generated_29c20e76.png',
  'https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/3394bcc60_generated_1a265a13.png',
  'https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/307f76e75_generated_dfa087e2.png',
  'https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/13b1a008e_generated_463e3cf8.png',
  'https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/228d87795_generated_f4c202cc.png',
  'https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/84501e12f_generated_fbfbfe76.png',
  'https://media.base44.com/images/public/6a44b0e0181b7c218a6623fd/5ce2785b5_generated_a29f5f5a.png'
];

const updateImages = async () => {
  try {
    const products = await Product.find({});
    
    for (let i = 0; i < products.length; i++) {
      products[i].image = images[i % images.length];
      await products[i].save();
    }
    
    console.log('Images Updated!');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

updateImages();

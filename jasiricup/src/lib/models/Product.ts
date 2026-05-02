// src/lib/models/Product.ts
import mongoose from 'mongoose';

// 1. Define the Variation Schema
const ProductVariationSchema = new mongoose.Schema({
  color: { type: String, required: true },
  size: { type: String, required: true },
  stockQuantity: { type: Number, default: 0, min: [0, 'Stock cannot be negative'] }
});

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this product.'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for this product.'],
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price for this product.'],
  },
  image: {
    type: String,
    required: false,
  },
  // 2. Replace flat stockQuantity with an array of variations
  variations: [ProductVariationSchema],
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
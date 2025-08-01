import mongoose from 'mongoose';

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
    type: String, // URL to the image, potentially from Cloudinary
    required: false,
  },
  // Add other product-specific fields as needed based on your Figma designs
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);

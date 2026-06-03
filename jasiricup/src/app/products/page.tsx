import connectDB from "@/lib/dbConnect";
import Product from "@/lib/models/Product";
import ProductsClient from "./ProductsClient";
import { Types } from "mongoose";

export const dynamic = 'force-dynamic';

// Define the shape of a single variation from the database
interface IRawVariation {
  color: string;
  size: string;
  stockQuantity: number;
  image?: string; // Added to interface
}

// Define the shape of the raw product document from MongoDB
interface IRawProduct {
  _id: Types.ObjectId;
  name: string;
  price: number;
  description: string;
  image?: string;
  variations?: IRawVariation[];
}

export default async function ProductsPage() {
  await connectDB();
  
  // Cast the lean() output safely by using unknown first, then our custom interface
  const rawProducts = (await Product.find({ isActive: true }).lean()) as unknown as IRawProduct[];

  const activeProducts = rawProducts.map(p => ({
    _id: p._id.toString(),
    name: p.name,
    price: p.price,
    description: p.description,
    image: p.image || null,
    variations: p.variations ? p.variations.map((v: IRawVariation) => ({
      color: v.color,
      size: v.size,
      stockQuantity: v.stockQuantity || 0,
      image: v.image || null // FIXED: Crucial line to forward variant images to the frontend!
    })) : []
  }));

  return <ProductsClient products={activeProducts} />;
}
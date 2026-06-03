import connectDB from "@/lib/dbConnect";
import Product from "@/lib/models/Product";
import ProductsClient from "./ProductsClient";
import { Types } from "mongoose";

export const dynamic = 'force-dynamic';

interface IRawVariation {
  color: string;
  size: string;
  stockQuantity: number;
  image?: string; 
}

interface IRawProduct {
  _id: Types.ObjectId;
  name: string;
  price: number;
  description: string;
  image?: string;
  isActive: boolean;
  variations?: IRawVariation[];
}

export default async function AdminProductsPage() {
  await connectDB();
  
  const rawProducts = (await Product.find().sort({ createdAt: -1 }).lean()) as unknown as IRawProduct[];

  const activeProducts = rawProducts.map(p => ({
    _id: p._id.toString(),
    name: p.name,
    price: p.price,
    description: p.description,
    image: p.image || '',
    isActive: p.isActive,
    variations: p.variations ? p.variations.map(v => ({
      color: v.color,
      size: v.size,
      stockQuantity: v.stockQuantity || 0,
      image: v.image || '' // FIXED: This tells the admin panel to remember the variant image!
    })) : []
  }));

  return <ProductsClient initialProducts={activeProducts} />;
}
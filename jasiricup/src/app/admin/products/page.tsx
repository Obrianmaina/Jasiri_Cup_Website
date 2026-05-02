// src/app/admin/products/page.tsx
import connectDB from "@/lib/dbConnect";
import Product from "@/lib/models/Product";
import ProductsClient from "./ProductsClient";
import { Types } from "mongoose";

export const dynamic = 'force-dynamic';

interface IRawVariation {
  color: string;
  size: string;
  stockQuantity: number;
}

interface IRawProduct {
  _id: Types.ObjectId;
  name: string;
  description: string;
  price: number;
  image: string;
  variations: IRawVariation[];
  isActive: boolean;
}

export default async function AdminProductsPage() {
  await connectDB();
  
  const rawProducts = (await Product.find({}).sort({ createdAt: -1 }).lean()) as unknown as IRawProduct[];

  const products = rawProducts.map((product) => ({
    _id: product._id.toString(),
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image || "",
    // Serialize variations safely
    variations: product.variations ? product.variations.map((v) => ({
      color: v.color,
      size: v.size,
      stockQuantity: v.stockQuantity || 0
    })) : [],
    isActive: product.isActive ?? true
  }));

  return <ProductsClient initialProducts={products} />;
}
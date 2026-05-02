// src/app/order/page.tsx
import connectDB from "@/lib/dbConnect";
import Product from "@/lib/models/Product";
import OrderClient from "./OrderClient";
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
  price: number;
  variations: IRawVariation[];
}

export default async function OrderPage() {
  await connectDB();
  
  // Fetch only active products from the database
  const rawProducts = (await Product.find({ isActive: true })
    .lean()) as unknown as IRawProduct[];

  // Serialize Mongoose Objects into plain strings
  const activeProducts = rawProducts.map(p => ({
    _id: p._id.toString(),
    name: p.name,
    price: p.price,
    variations: p.variations ? p.variations.map(v => ({
      color: v.color,
      size: v.size,
      stockQuantity: v.stockQuantity || 0
    })) : []
  }));

  return <OrderClient activeProducts={activeProducts} />;
}
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/lib/models/Product';

export async function GET(req: Request) {
  await dbConnect();

  try {
    const products = await Product.find({});
    return NextResponse.json({ data: products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// SECURITY FIX: The POST export has been removed. 
// Product creation must go through the protected /api/admin/products route.
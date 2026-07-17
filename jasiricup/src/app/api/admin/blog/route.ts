// src/app/api/admin/blog/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import { revalidateTag } from "next/cache";
import { checkAdminAuth } from "@/lib/auth-middleware";

// Force Next.js to always fetch fresh data, bypassing the static route cache
export const dynamic = 'force-dynamic';

// Define a strict type for our MongoDB query to avoid 'any'
interface BlogQuery {
  status?: string;
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
}

export async function GET(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    
    // Use nextUrl.searchParams for reliable query parsing in Next.js App Router
    const searchParams = req.nextUrl.searchParams;
    
    const page    = Math.max(1, parseInt(searchParams.get("page") || "1",  10));
    const limit   = Math.min(50, parseInt(searchParams.get("limit") || "20", 10));
    const search  = searchParams.get("search") || "";
    const status  = searchParams.get("status") || ""; 
    const sortBy  = searchParams.get("sortBy") || "createdAt";
    const sortDir = searchParams.get("sortDir") || "desc";

    const query: BlogQuery = {};

    // Strictly apply the status filter to the database query
    if (status === "draft" || status === "published") {
      query.status = status;
    }

    // SECURITY FIX: Escape regex search string to prevent ReDoS attacks
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Apply text search logic
    if (search.trim()) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { author: { $regex: safeSearch, $options: "i" } },
        { metaDescription: { $regex: safeSearch, $options: "i" } },
        { tags: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const allowedSortFields = ["createdAt", "updatedAt", "publishedDate", "title", "viewCount"];
    const safeSortBy  = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const safeSortDir = sortDir === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      BlogPost.find(query)
        .sort({ [safeSortBy]: safeSortDir })
        .skip(skip)
        .limit(limit)
        .select("-blocks")
        .lean(),
      BlogPost.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: blogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching admin blog list:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    const body = await req.json();

    if (!body.title?.trim()) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }
    if (!body.content?.trim()) {
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 });
    }

    if (body.status === "published" && !body.publishedDate) {
      body.publishedDate = new Date();
    }

    const blog = await BlogPost.create(body);
    revalidateTag("blog-posts");

    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating blog:", error);
    
    // Type-safe error handling for Mongoose
    if (error && typeof error === "object") {
      const err = error as Record<string, unknown>;
      
      if (err.name === "ValidationError" && err.errors) {
        const errors = err.errors as Record<string, { message: string }>;
        const messages = Object.values(errors).map(e => e.message);
        return NextResponse.json(
          { success: false, error: "Validation failed", details: messages },
          { status: 422 }
        );
      }
      
      if (err.code === 11000) {
        return NextResponse.json(
          { success: false, error: "A post with this slug already exists" },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json({ success: false, error: "Failed to create blog" }, { status: 500 });
  }
}
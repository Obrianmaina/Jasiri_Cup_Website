// src/app/api/admin/blog/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import BlogPost from "@/lib/models/BlogPost";
import { revalidateTag } from "next/cache";
import { checkAdminAuth } from "@/lib/auth-middleware";

/**
 * GET all blog posts for admin (all statuses, with pagination & search)
 */
export async function GET(req: NextRequest) {
  const authCheck = checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page    = Math.max(1, parseInt(searchParams.get("page")    || "1",  10));
    const limit   = Math.min(50, parseInt(searchParams.get("limit")   || "20", 10));
    const search  = searchParams.get("search")  || "";
    const status  = searchParams.get("status")  || "";   // "draft" | "published" | ""
    const sortBy  = searchParams.get("sortBy")  || "createdAt";
    const sortDir = searchParams.get("sortDir") || "desc";

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (status === "draft" || status === "published") query.status = status;
    if (search.trim()) {
      query.$or = [
        { title:           { $regex: search, $options: "i" } },
        { author:          { $regex: search, $options: "i" } },
        { metaDescription: { $regex: search, $options: "i" } },
        { tags:            { $regex: search, $options: "i" } },
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
/**
 * POST - create a new blog post (admin only)
 */
export async function POST(req: NextRequest) {
  const authCheck = checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await connectDB();
    const body = await req.json();

    // Validate required fields
    if (!body.title?.trim()) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }
    if (!body.content?.trim()) {
      return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 });
    }

    // Set publishedDate when first publishing
    if (body.status === "published" && !body.publishedDate) {
      body.publishedDate = new Date();
    }

    const blog = await BlogPost.create(body);
    revalidateTag("blog-posts");

    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating blog:", error);

    // Surface Mongoose validation errors cleanly
    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      (error as { name: string }).name === "ValidationError"
    ) {
      // Added "unknown" as a stepping stone
      const ve = error as unknown as { errors: Record<string, { message: string }> };
      const messages = Object.values(ve.errors).map((e) => e.message);
      return NextResponse.json(
        { success: false, error: "Validation failed", details: messages },
        { status: 422 }
      );
    }

    // Duplicate slug
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, error: "A post with this slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: false, error: "Failed to create blog" }, { status: 500 });
  }
}

// Explicitly block other verbs
export async function PUT() {
  return NextResponse.json({ success: false, error: "Method not allowed - use /api/admin/blog/[id]" }, { status: 405 });
}
export async function DELETE() {
  return NextResponse.json({ success: false, error: "Method not allowed - use /api/admin/blog/[id]" }, { status: 405 });
}
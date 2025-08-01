import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BlogPost from '@/lib/models/BlogPost';

export async function GET(req: Request) {
  await dbConnect();

  try {
    const blogPosts = await BlogPost.find({});
    return NextResponse.json({ data: blogPosts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const body = await req.json();
    const newBlogPost = await BlogPost.create(body);
    return NextResponse.json({ message: 'Blog post created successfully!', data: newBlogPost }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

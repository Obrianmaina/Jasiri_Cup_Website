// src/app/api/admin/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (token === process.env.ADMIN_SECRET_TOKEN) {
      const response = NextResponse.json({ success: true, message: 'Authentication successful' });
      
      // Set HTTP-only cookie
      response.cookies.set({
        name: 'admin-token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 86400, // 24 hours
        path: '/',
      });
      
      return response;
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  response.cookies.delete('admin-token');
  
  return response;
}
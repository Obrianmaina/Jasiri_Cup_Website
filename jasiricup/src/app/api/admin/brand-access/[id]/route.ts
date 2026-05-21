// src/app/api/admin/brand-access/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/auth-middleware';
import dbConnect from '@/lib/dbConnect';
import BrandAccess from '@/lib/models/BrandAccess';
import { v4 as uuidv4 } from 'uuid';
import { sendBrandAccessEmail } from '@/lib/sendBrandEmail';

interface UpdateData {
  status: string;
  accessToken?: string;
  approvedAt?: Date;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await checkAdminAuth(req);
  if (!authCheck.isAuthorized) return authCheck.response!;

  try {
    await dbConnect();
    const { status } = await req.json();
    const { id } = await params;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateData: UpdateData = { status };
    let newAccessToken = '';

    if (status === 'approved') {
      newAccessToken = uuidv4();
      updateData.accessToken = newAccessToken;
      updateData.approvedAt = new Date();
    }

    const updatedRequest = await BrandAccess.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (status === 'approved' && newAccessToken) {
      try {
        await sendBrandAccessEmail({
          to: updatedRequest.email,
          name: updatedRequest.name,
          token: newAccessToken
        });
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }
    }

    return NextResponse.json({ request: updatedRequest }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating brand access status:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
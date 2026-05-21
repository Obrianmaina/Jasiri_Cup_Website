// src/app/api/admin/brand-access/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import dbConnect from '@/lib/dbConnect';
import BrandAccess from '@/lib/models/BrandAccess';
import { v4 as uuidv4 } from 'uuid';
import { sendBrandAccessEmail } from '@/lib/sendBrandEmail'; // Import the new email utility

interface CustomUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

interface UpdateData {
  status: string;
  accessToken?: string;
  approvedAt?: Date;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as CustomUser | undefined;

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { status } = await req.json();
    const resolvedParams = await params;
    const { id } = resolvedParams;

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

    // Trigger the email if the status was changed to approved
    if (status === 'approved' && newAccessToken) {
      try {
        await sendBrandAccessEmail({
          to: updatedRequest.email,
          name: updatedRequest.name,
          token: newAccessToken
        });
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
        // We still return a 200 OK because the DB updated successfully, 
        // but you might want to log this failure in a production environment.
      }
    }

    return NextResponse.json({ request: updatedRequest }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error updating brand access status:', error.message);
    } else {
      console.error('Error updating brand access status:', String(error));
    }
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
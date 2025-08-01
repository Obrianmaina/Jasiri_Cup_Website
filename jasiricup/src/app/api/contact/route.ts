import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import ContactMessage from '@/lib/models/ContactMessage';

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { name, topic, message } = await req.json();

    if (!name || !topic || !message) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const newContactMessage = await ContactMessage.create({ name, topic, message });

    return NextResponse.json({ message: 'Message sent successfully!', data: newContactMessage }, { status: 201 });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

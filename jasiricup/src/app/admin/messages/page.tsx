// src/app/admin/messages/page.tsx
import connectDB from "@/lib/dbConnect";
import ContactMessage from "@/lib/models/ContactMessage";
import Order from "@/lib/models/Order";
import MessagesClient from "./MessagesClient";
import { Types } from "mongoose";

export const dynamic = 'force-dynamic';

interface IRawContactMessage {
  _id: Types.ObjectId;
  name: string;
  email: string;
  topic: string;
  message: string;
  status?: string; // Added status
  createdAt: Date;
}

interface IRawOrderItem {
  quantity: number;
  color: string;
  size: string;
  customNotes?: string;
}

interface IRawOrder {
  _id: Types.ObjectId;
  clientInfo: {
    name: string;
    email: string;
    phone: string;
  };
  items: IRawOrderItem[];
  status?: string; // Added status
  createdAt: Date;
}

export default async function AdminMessagesPage() {
  await connectDB();
  
  const rawMessages = (await ContactMessage.find({}).sort({ createdAt: -1 }).lean()) as unknown as IRawContactMessage[];
  const rawOrders = (await Order.find({}).sort({ createdAt: -1 }).lean()) as unknown as IRawOrder[];

  const messages = rawMessages.map((msg: IRawContactMessage) => ({
    _id: msg._id.toString(),
    name: msg.name,
    email: msg.email,
    topic: msg.topic,
    message: msg.message,
    status: msg.status || 'new', // Include status
    createdAt: msg.createdAt.toISOString()
  }));

  const orders = rawOrders.map((order: IRawOrder) => ({
    _id: order._id.toString(),
    clientInfo: {
      name: order.clientInfo.name,
      email: order.clientInfo.email,
      phone: order.clientInfo.phone
    },
    items: order.items.map((item: IRawOrderItem) => ({
      quantity: item.quantity,
      color: item.color,
      size: item.size,
      customNotes: item.customNotes || "" 
    })),
    status: order.status || 'pending', // Include status
    createdAt: order.createdAt.toISOString()
  }));

  return <MessagesClient initialMessages={messages} initialOrders={orders} />;
}
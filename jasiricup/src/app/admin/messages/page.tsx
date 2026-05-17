// src/app/admin/messages/page.tsx
import connectDB from "@/lib/dbConnect";
import ContactMessage from "@/lib/models/ContactMessage";
import Order from "@/lib/models/Order";
import Volunteer from "@/lib/models/Volunteer";
import MessagesClient from "./MessagesClient";
import { Types } from "mongoose";

export const dynamic = 'force-dynamic';

interface IRawContactMessage {
  _id: Types.ObjectId;
  name: string;
  email: string;
  topic: string;
  message: string;
  status?: string;
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
  status?: string;
  createdAt: Date;
}

interface IRawVolunteer {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  roles: string[];
  message: string;
  status?: string;
  createdAt: Date;
}

export default async function AdminMessagesPage() {
  await connectDB();
  
  const rawMessages = (await ContactMessage.find({}).sort({ createdAt: -1 }).lean()) as unknown as IRawContactMessage[];
  const rawOrders = (await Order.find({}).sort({ createdAt: -1 }).lean()) as unknown as IRawOrder[];
  const rawVolunteers = (await Volunteer.find({}).sort({ createdAt: -1 }).lean()) as unknown as IRawVolunteer[];

  const messages = rawMessages.map((msg: IRawContactMessage) => ({
    _id: msg._id.toString(),
    name: msg.name,
    email: msg.email,
    topic: msg.topic,
    message: msg.message,
    status: msg.status || 'new',
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
    status: order.status || 'pending',
    createdAt: order.createdAt.toISOString()
  }));

  const volunteers = rawVolunteers.map((vol: IRawVolunteer) => ({
    _id: vol._id.toString(),
    name: vol.name,
    email: vol.email,
    phone: vol.phone,
    roles: vol.roles || [],
    message: vol.message,
    status: vol.status || 'pending',
    createdAt: vol.createdAt.toISOString()
  }));

  return <MessagesClient initialMessages={messages} initialOrders={orders} initialVolunteers={volunteers} />;
}
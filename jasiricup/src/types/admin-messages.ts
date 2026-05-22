export type TabType = 'messages' | 'orders' | 'volunteers';

export interface IContactMessage {
  _id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: string;
  createdAt: string;
}

export interface IOrderItem {
  quantity: number;
  color: string;
  size: string;
  customNotes: string;
}

export interface IOrder {
  _id: string;
  clientInfo: { name: string; email: string; phone: string; };
  items: IOrderItem[];
  status: string;
  createdAt: string;
}

export interface IVolunteer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  roles: string[];
  message: string;
  status: string;
  createdAt: string;
}
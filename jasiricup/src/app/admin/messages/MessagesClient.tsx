'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ConfirmModal } from '@/components/ui/Modal'; // Import the new modal

interface IContactMessage {
  _id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: string;
  createdAt: string;
}

interface IOrderItem {
  quantity: number;
  color: string;
  size: string;
  customNotes: string;
}

interface IOrder {
  _id: string;
  clientInfo: { name: string; email: string; phone: string; };
  items: IOrderItem[];
  status: string;
  createdAt: string;
}

interface MessagesClientProps {
  initialMessages: IContactMessage[];
  initialOrders: IOrder[];
}

export default function MessagesClient({ initialMessages, initialOrders }: MessagesClientProps) {
  const [activeTab, setActiveTab] = useState<'messages' | 'orders'>('messages');
  const [messages, setMessages] = useState<IContactMessage[]>(initialMessages);
  const [orders, setOrders] = useState<IOrder[]>(initialOrders);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // New state for delete confirmation
  const [itemToDelete, setItemToDelete] = useState<{type: 'messages' | 'orders', id: string} | null>(null);

  const TABS = [
    { id: 'messages', label: 'Contact Messages', count: messages.length },
    { id: 'orders', label: 'Product Orders', count: orders.length },
  ] as const;

  const handleUpdateStatus = async (type: 'messages' | 'orders', id: string, newStatus: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/${type}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      
      if (type === 'messages') {
        setMessages(messages.map(m => m._id === id ? { ...m, status: newStatus } : m));
      } else {
        setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
      }
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  // Setup the request
  const handleDeleteRequest = (type: 'messages' | 'orders', id: string) => {
    setItemToDelete({ type, id });
  };

  // Execute the delete after confirmation
  const executeDelete = async () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;
    setItemToDelete(null);

    setProcessingId(id);
    const loadingToast = toast.loading('Deleting...');
    try {
      const res = await fetch(`/api/admin/${type}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      
      if (type === 'messages') setMessages(messages.filter(m => m._id !== id));
      if (type === 'orders') setOrders(orders.filter(o => o._id !== id));
      
      toast.success('Deleted successfully', { id: loadingToast });
    } catch {
      toast.error('Failed to delete', { id: loadingToast });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto transition-colors duration-300">
      <div>
        <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mb-4 transition-colors">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Inbox</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage messages and orders submitted by users.</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 transition-colors">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'messages' | 'orders')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 ${
              activeTab === tab.id
                ? 'border-purple-600 dark:border-purple-500 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs transition-colors ${activeTab === tab.id ? 'bg-purple-200 dark:bg-purple-800/50 text-purple-800 dark:text-purple-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'messages' && (
          messages.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center transition-colors">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No messages found in your inbox.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {messages.map((msg) => (
                <div key={msg._id} className={`bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border transition-colors ${msg.status === 'new' ? 'border-purple-300 dark:border-purple-700' : 'border-gray-100 dark:border-gray-800'}`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{msg.name}</h3>
                        {msg.status === 'new' && <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">New</span>}
                      </div>
                      <a href={`mailto:${msg.email}`} className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-sm transition-colors">{msg.email}</a>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select 
                        value={msg.status}
                        onChange={(e) => handleUpdateStatus('messages', msg._id, e.target.value)}
                        disabled={processingId === msg._id}
                        className="text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-2 py-1.5 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="archived">Archived</option>
                      </select>
                      {/* Updated to call handleDeleteRequest */}
                      <button 
                        onClick={() => handleDeleteRequest('messages', msg._id)}
                        disabled={processingId === msg._id}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="mb-2 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Topic</span>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{msg.topic}</p>
                    </div>
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap transition-colors">
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'orders' && (
          orders.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center transition-colors">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No orders have been placed yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {orders.map((order) => (
                <div key={order._id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{order.clientInfo.name}</h3>
                      <div className="flex gap-4 text-sm mt-1">
                        <a href={`mailto:${order.clientInfo.email}`} className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">{order.clientInfo.email}</a>
                        <a href={`tel:${order.clientInfo.phone}`} className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">{order.clientInfo.phone}</a>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select 
                        value={order.status}
                        onChange={(e) => handleUpdateStatus('orders', order._id, e.target.value)}
                        disabled={processingId === order._id}
                        className={`text-xs border rounded-lg px-2 py-1.5 font-semibold focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors ${
                          order.status === 'pending' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 
                          order.status === 'shipped' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
                          order.status === 'cancelled' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' :
                          'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <option value="pending" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Pending</option>
                        <option value="processing" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Processing</option>
                        <option value="shipped" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Shipped</option>
                        <option value="cancelled" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">Cancelled</option>
                      </select>
                      {/* Updated to call handleDeleteRequest */}
                      <button 
                        onClick={() => handleDeleteRequest('orders', order._id)}
                        disabled={processingId === order._id}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-xs px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Order Items</span>
                      <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg flex flex-col sm:flex-row gap-4 justify-between items-start transition-colors">
                        <div className="flex gap-4">
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-4 py-2 text-center transition-colors">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Qty</p>
                            <p className="font-bold text-gray-900 dark:text-white">{item.quantity}</p>
                          </div>
                          <div className="pt-1">
                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Color: {item.color}</p>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Size: {item.size}</p>
                          </div>
                        </div>
                        {item.customNotes && (
                          <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs italic border-l-2 border-purple-300 dark:border-purple-600 pl-3">
                            &quot;{item.customNotes}&quot;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={executeDelete}
        title={itemToDelete?.type === 'orders' ? 'Delete Order' : 'Delete Message'}
        message={`Are you sure you want to delete this ${itemToDelete?.type === 'orders' ? 'order' : 'message'}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
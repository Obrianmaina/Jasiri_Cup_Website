import React from 'react';
import { IOrder } from '@/types/admin-messages';

interface Props {
  orders: IOrder[];
  processingId: string | null;
  onUpdateStatus: (id: string, status: string) => void;
  onReply: (email: string, name: string, subject: string) => void;
  onDelete: (id: string) => void;
}

export default function OrdersTab({ orders, processingId, onUpdateStatus, onReply, onDelete }: Props) {
  if (orders.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center transition-colors">
        <p className="text-gray-500 dark:text-gray-400 text-lg">No orders have been placed yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {orders.map((order) => (
        <div key={order._id} className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{order.clientInfo.name}</h3>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-sm mt-1">
                <a href={`mailto:${order.clientInfo.email}`} className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 break-all">{order.clientInfo.email}</a>
                <a href={`tel:${order.clientInfo.phone}`} className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">{order.clientInfo.phone}</a>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
              <select 
                value={order.status}
                onChange={(e) => onUpdateStatus(order._id, e.target.value)}
                disabled={processingId === order._id}
                className={`text-sm md:text-xs border rounded-lg px-3 py-2 md:px-2 md:py-1.5 font-semibold focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors w-full sm:w-auto ${
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
              <div className="flex w-full sm:w-auto gap-2">
                <button 
                  onClick={() => onReply(order.clientInfo.email, order.clientInfo.name, 'Update regarding your JasiriCup Order')}
                  className="flex-1 sm:flex-none text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-sm md:text-xs px-4 py-2 md:px-3 md:py-1.5 rounded-lg border border-purple-100 dark:border-purple-900/30 hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-colors text-center"
                >
                  Reply
                </button>
                <button 
                  onClick={() => onDelete(order._id)}
                  disabled={processingId === order._id}
                  className="flex-1 sm:flex-none text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm md:text-xs px-4 py-2 md:px-3 md:py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 text-center"
                >
                  Delete
                </button>
              </div>
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
                  <div className="text-sm text-gray-600 dark:text-gray-300 w-full sm:max-w-xs italic border-l-2 border-purple-300 dark:border-purple-600 pl-3 mt-2 sm:mt-0">
                    &quot;{item.customNotes}&quot;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
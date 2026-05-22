import React from 'react';
import { IContactMessage } from '@/types/admin-messages';

interface Props {
  messages: IContactMessage[];
  processingId: string | null;
  onUpdateStatus: (id: string, status: string) => void;
  onReply: (email: string, name: string, subject: string) => void;
  onDelete: (id: string) => void;
}

export default function MessagesTab({ messages, processingId, onUpdateStatus, onReply, onDelete }: Props) {
  if (messages.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center transition-colors">
        <p className="text-gray-500 dark:text-gray-400 text-lg">No messages found in your inbox.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {messages.map((msg) => (
        <div key={msg._id} className={`bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl shadow-sm border transition-colors ${msg.status === 'new' ? 'border-purple-300 dark:border-purple-700' : 'border-gray-100 dark:border-gray-800'}`}>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{msg.name}</h3>
                {msg.status === 'new' && <span className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">New</span>}
              </div>
              <a href={`mailto:${msg.email}`} className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-sm transition-colors break-all">{msg.email}</a>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
              <select 
                value={msg.status}
                onChange={(e) => onUpdateStatus(msg._id, e.target.value)}
                disabled={processingId === msg._id}
                className="text-sm md:text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 md:px-2 md:py-1.5 focus:ring-purple-500 focus:border-purple-500 transition-colors w-full sm:w-auto"
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="archived">Archived</option>
              </select>
              <div className="flex w-full sm:w-auto gap-2">
                <button 
                  onClick={() => onReply(msg.email, msg.name, `Re: ${msg.topic}`)}
                  className="flex-1 sm:flex-none text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-sm md:text-xs px-4 py-2 md:px-3 md:py-1.5 rounded-lg border border-purple-100 dark:border-purple-900/30 hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-colors text-center"
                >
                  Reply
                </button>
                <button 
                  onClick={() => onDelete(msg._id)}
                  disabled={processingId === msg._id}
                  className="flex-1 sm:flex-none text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm md:text-xs px-4 py-2 md:px-3 md:py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 text-center"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div className="mb-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
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
  );
}
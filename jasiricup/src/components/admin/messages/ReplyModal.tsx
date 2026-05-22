import React from 'react';

interface ReplyModalProps {
  isOpen: boolean;
  name: string;
  email: string;
  subject: string;
  replyText: string;
  sendingReply: boolean;
  onClose: () => void;
  onSubjectChange: (val: string) => void;
  onReplyTextChange: (val: string) => void;
  onSend: () => void;
}

export default function ReplyModal({ isOpen, name, email, subject, replyText, sendingReply, onClose, onSubjectChange, onReplyTextChange, onSend }: ReplyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 dark:border-gray-800">
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Reply to {name}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To:</label>
            <input 
              type="text" 
              disabled 
              value={email} 
              className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject:</label>
            <input 
              type="text" 
              value={subject} 
              onChange={(e) => onSubjectChange(e.target.value)} 
              className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message:</label>
            <textarea 
              rows={6} 
              value={replyText} 
              onChange={(e) => onReplyTextChange(e.target.value)} 
              placeholder="Type your message here..." 
              className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition-colors" 
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex flex-col sm:flex-row justify-end gap-3">
          <button 
            onClick={onClose} 
            className="w-full sm:w-auto px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={onSend} 
            disabled={sendingReply || !replyText.trim()} 
            className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {sendingReply && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {sendingReply ? 'Sending...' : 'Send Reply'}
          </button>
        </div>
      </div>
    </div>
  );
}
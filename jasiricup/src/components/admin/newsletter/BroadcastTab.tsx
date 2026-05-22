import React, { useState } from 'react';

interface Props {
  onSend: (formData: FormData) => Promise<void>;
  isSending: boolean;
}

export function BroadcastTab({ onSend, isSending }: Props) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('message', message);
    
    files.forEach((file) => {
      formData.append('attachments', file); // Append all files under the same key or unique keys
    });

    await onSend(formData);
    
    // Clear form on success
    setSubject('');
    setMessage('');
    setFiles([]);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 space-y-6">
      
      <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 p-4 rounded-xl">
        <h3 className="font-bold text-purple-800 dark:text-purple-400 mb-1">Broadcast Notice</h3>
        <p className="text-sm text-purple-600 dark:text-purple-500">
          This email will be wrapped in the official JasiriCup branded template. Subscribers will be BCC&apos;d to protect their privacy.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject Line</label>
        <input 
          required 
          type="text" 
          value={subject} 
          onChange={(e) => setSubject(e.target.value)} 
          className="w-full border rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500" 
          placeholder="e.g. JasiriCup Monthly Update!" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Body</label>
        <textarea 
          required 
          rows={8} 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          className="w-full border rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-gray-800 dark:border-gray-700 outline-none focus:ring-2 focus:ring-purple-500 resize-y" 
          placeholder="Type your message here. Line breaks will be preserved..." 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attach Files (Optional)</label>
        <input 
          type="file" 
          multiple
          onChange={(e) => {
            if (e.target.files) setFiles(Array.from(e.target.files));
          }}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/30 dark:file:text-purple-400"
        />
        {files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {files.map((f, i) => (
              <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700">
                {f.name} ({(f.size / 1024).toFixed(1)}kb)
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
        <button 
          type="submit" 
          disabled={isSending} 
          className="px-6 py-3 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl disabled:opacity-50 transition-colors shadow-sm"
        >
          {isSending ? 'Dispatching Broadcast...' : 'Send Branded Broadcast'}
        </button>
      </div>
    </form>
  );
}
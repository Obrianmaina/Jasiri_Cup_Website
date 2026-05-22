'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { SubscribersTab, ISubscriber } from '@/components/admin/newsletter/SubscribersTab';
import { BroadcastTab } from '@/components/admin/newsletter/BroadcastTab';

export default function NewsletterClient() {
  const [activeTab, setActiveTab] = useState<'subscribers' | 'broadcast'>('subscribers');
  const [subscribers, setSubscribers] = useState<ISubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const res = await fetch('/api/admin/subscribers');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setSubscribers(data.subscribers);
      } catch (error) {
        toast.error('Failed to load subscribers');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscribers();
  }, []);

  const handleBroadcast = async (formData: FormData) => {
    setIsSending(true);
    const toastId = toast.loading('Dispatching emails...');
    
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        body: formData, // Sending directly as multipart/form-data
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send broadcast');
      }

      const data = await res.json();
      toast.success(`Successfully sent to ${data.sentCount} subscribers!`, { id: toastId });
      setActiveTab('subscribers'); // Route them back to the list on success
    } catch (error: unknown) {
      // Type narrowing: Check if the unknown error is a standard Error object
      if (error instanceof Error) {
        toast.error(error.message, { id: toastId });
      } else {
        // Fallback for unexpected error types (like strings or null)
        toast.error('An unexpected error occurred', { id: toastId });
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="pt-8 pb-24 space-y-6 md:space-y-8 max-w-6xl mx-auto px-4 sm:px-6">
      
      {/* Header and Back Link */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <div className="mb-3">
            <Link 
              href="/admin/dashboard" 
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Newsletter & Audience</h1>
          
          <div className="flex gap-4 mt-4">
            <button 
              onClick={() => setActiveTab('subscribers')} 
              className={`text-sm font-bold pb-2 border-b-2 transition-colors ${activeTab === 'subscribers' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Subscribers List
            </button>
            <button 
              onClick={() => setActiveTab('broadcast')} 
              className={`text-sm font-bold pb-2 border-b-2 transition-colors ${activeTab === 'broadcast' ? 'border-purple-600 text-purple-600 dark:text-purple-400' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
            >
              Broadcast Email
            </button>
          </div>
        </div>
      </div>

      {/* Render Active Tab Component */}
      {activeTab === 'subscribers' ? (
        <SubscribersTab subscribers={subscribers} isLoading={isLoading} />
      ) : (
        <BroadcastTab onSend={handleBroadcast} isSending={isSending} />
      )}

    </div>
  );
}
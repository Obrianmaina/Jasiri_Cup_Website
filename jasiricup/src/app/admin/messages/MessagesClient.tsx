'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import MessagesTab from '@/components/admin/messages/MessagesTab';
import OrdersTab from '@/components/admin/messages/OrdersTab';
import VolunteersTab from '@/components/admin/messages/VolunteersTab';
import ReplyModal from '@/components/admin/messages/ReplyModal';
import { SuccessModal } from '@/components/ui/Modal'; // Imported your existing SuccessModal
import { IContactMessage, IOrder, IVolunteer, TabType } from '@/types/admin-messages'; //

interface MessagesClientProps {
  initialMessages: IContactMessage[];
  initialOrders: IOrder[];
  initialVolunteers: IVolunteer[];
}

export default function MessagesClient({
  initialMessages,
  initialOrders,
  initialVolunteers
}: MessagesClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('messages');
  const [messages, setMessages] = useState<IContactMessage[]>(initialMessages);
  const [orders, setOrders] = useState<IOrder[]>(initialOrders);
  const [volunteers, setVolunteers] = useState<IVolunteer[]>(initialVolunteers);

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [sendingReply, setSendingReply] = useState(false);

  // Reply Modal Form State
  const [replyModal, setReplyModal] = useState({
    isOpen: false,
    name: '',
    email: '',
    subject: '',
    replyText: ''
  });

  // NEW: State to handle your centered alert popup modal[cite: 3]
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  const handleUpdateMessageStatus = async (id: string, newStatus: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error();
      setMessages(messages.map(m => m._id === id ? { ...m, status: newStatus } : m));
      toast.success('Message status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error();
      setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateVolunteerStatus = async (id: string, newStatus: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/volunteers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error();
      setVolunteers(volunteers.map(v => v._id === id ? { ...v, status: newStatus } : v));
      toast.success('Volunteer status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteItem = async (id: string, endpoint: 'messages' | 'orders' | 'volunteers') => {
    if (!confirm('Are you sure you want to permanently delete this record?')) return;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/${endpoint}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      
      if (endpoint === 'messages') setMessages(messages.filter(m => m._id !== id));
      if (endpoint === 'orders') setOrders(orders.filter(o => o._id !== id));
      if (endpoint === 'volunteers') setVolunteers(volunteers.filter(v => v._id !== id));
      
      toast.success('Record deleted permanently');
    } catch {
      toast.error('Failed to delete record');
    } finally {
      setProcessingId(null);
    }
  };

  const openReplyModal = (email: string, name: string, defaultSubject: string) => {
    setReplyModal({
      isOpen: true,
      name,
      email,
      subject: defaultSubject,
      replyText: ''
    });
  };

  // FIXED: Dispatch the correct payload properties matching your backend API expectations
  const handleSendReply = async () => {
    setSendingReply(true);
    try {
      const res = await fetch('/api/admin/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: replyModal.email, // 
          toName: replyModal.name,   // 
          subject: replyModal.subject,
          message: replyModal.replyText
        })
      });

      if (!res.ok) throw new Error('Failed to forward email dispatch');

      // Close the current raw reply modal input mask safely
      setReplyModal(prev => ({ ...prev, isOpen: false }));

      // Open your beautiful centered visual success dialog window
      setSuccessModal({
        isOpen: true,
        title: 'Reply Dispatched!',
        message: `Your branded response message has been sent successfully to ${replyModal.name} (${replyModal.email}).`
      });

    } catch (error) {
      console.error(error);
      toast.error('Could not deliver email response. Please check SMTP logs.');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Communications Hub</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Review customer messages, product sales, and open volunteer applications.</p>
      </div>

      {/* Tabs Row Layout */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6 gap-2">
        {(['messages', 'orders', 'volunteers'] as TabType[]).map((tab) => ( //[cite: 3]
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 font-bold text-sm uppercase tracking-wide border-b-2 transition-all capitalize ${
              activeTab === tab
                ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Rendering Blocks */}
      <div className="space-y-6">
        {activeTab === 'messages' && (
          <MessagesTab
            messages={messages}
            processingId={processingId}
            onUpdateStatus={handleUpdateMessageStatus}
            onReply={openReplyModal}
            onDelete={(id) => handleDeleteItem(id, 'messages')}
          /> //[cite: 3]
        )}

        {activeTab === 'orders' && (
          <OrdersTab
            orders={orders}
            processingId={processingId}
            onUpdateStatus={handleUpdateOrderStatus}
            onReply={openReplyModal}
            onDelete={(id) => handleDeleteItem(id, 'orders')}
          /> //[cite: 3]
        )}

        {activeTab === 'volunteers' && (
          <VolunteersTab
            volunteers={volunteers}
            processingId={processingId}
            onUpdateStatus={handleUpdateVolunteerStatus}
            onReply={openReplyModal}
            onDelete={(id) => handleDeleteItem(id, 'volunteers')}
          /> //[cite: 3]
        )}
      </div>

      {/* Interactive Reply Formulation Overlay Mask[cite: 3] */}
      <ReplyModal
        isOpen={replyModal.isOpen}
        name={replyModal.name}
        email={replyModal.email}
        subject={replyModal.subject}
        replyText={replyModal.replyText}
        sendingReply={sendingReply}
        onClose={() => setReplyModal(prev => ({ ...prev, isOpen: false }))}
        onSubjectChange={(val) => setReplyModal(prev => ({ ...prev, subject: val }))}
        onReplyTextChange={(val) => setReplyModal(prev => ({ ...prev, replyText: val }))}
        onSend={handleSendReply}
      /> {/*[cite: 3] */}

      {/* Global Success Notification Dialog Alert[cite: 3] */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
        buttonText="Back to Inbox"
      /> {/*[cite: 3] */}
    </div>
  );
}
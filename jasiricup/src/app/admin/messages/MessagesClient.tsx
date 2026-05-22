'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ConfirmModal } from '@/components/ui/Modal'; 
import { TabType, IContactMessage, IOrder, IVolunteer } from '@/types/admin-messages';

import MessagesTab from '@/components/admin/messages/MessagesTab';
import OrdersTab from '@/components/admin/messages/OrdersTab';
import VolunteersTab from '@/components/admin/messages/VolunteersTab';
import ReplyModal from '@/components/admin/messages/ReplyModal';

interface MessagesClientProps {
  initialMessages: IContactMessage[];
  initialOrders: IOrder[];
  initialVolunteers: IVolunteer[];
}

export default function MessagesClient({ initialMessages, initialOrders, initialVolunteers }: MessagesClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('messages');
  const [messages, setMessages] = useState<IContactMessage[]>(initialMessages);
  const [orders, setOrders] = useState<IOrder[]>(initialOrders);
  const [volunteers, setVolunteers] = useState<IVolunteer[]>(initialVolunteers);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, type: TabType, id: string}>({
    isOpen: false,
    type: 'messages',
    id: ''
  });

  const [replyModal, setReplyModal] = useState({ isOpen: false, email: '', name: '', subject: '' });
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const TABS = [
    { id: 'messages', label: 'Contact Messages', count: messages.length },
    { id: 'orders', label: 'Product Orders', count: orders.length },
    { id: 'volunteers', label: 'Volunteers', count: volunteers.length },
  ] as const;

  const handleUpdateStatus = async (type: TabType, id: string, newStatus: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/${type}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      
      if (type === 'messages') setMessages(messages.map(m => m._id === id ? { ...m, status: newStatus } : m));
      if (type === 'orders') setOrders(orders.map(o => o._id === id ? { ...o, status: newStatus } : o));
      if (type === 'volunteers') setVolunteers(volunteers.map(v => v._id === id ? { ...v, status: newStatus } : v));
      
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const closeDeleteModal = () => setDeleteModal(prev => ({ ...prev, isOpen: false }));

  const executeDelete = async () => {
    if (!deleteModal.id) return;
    const { type, id } = deleteModal;
    
    closeDeleteModal();

    setProcessingId(id);
    const loadingToast = toast.loading('Deleting...');
    try {
      const res = await fetch(`/api/admin/${type}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      
      if (type === 'messages') setMessages(messages.filter(m => m._id !== id));
      if (type === 'orders') setOrders(orders.filter(o => o._id !== id));
      if (type === 'volunteers') setVolunteers(volunteers.filter(v => v._id !== id));
      
      toast.success('Deleted successfully', { id: loadingToast });
    } catch {
      toast.error('Failed to delete', { id: loadingToast });
    } finally {
      setProcessingId(null);
    }
  };

  const openReplyModal = (email: string, name: string, defaultSubject: string) => {
    setReplyModal({ isOpen: true, email, name, subject: defaultSubject });
    setReplyText('');
  };

  const executeReply = async () => {
    if (!replyText.trim()) return;
    
    setSendingReply(true);
    const toastId = toast.loading('Sending email...');

    try {
      const res = await fetch('/api/admin/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: replyModal.email,
          toName: replyModal.name,
          subject: replyModal.subject,
          message: replyText
        }),
      });

      if (!res.ok) throw new Error();
      
      toast.success('Reply sent successfully!', { id: toastId });
      setReplyModal({ ...replyModal, isOpen: false });
    } catch {
      toast.error('Failed to send reply', { id: toastId });
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="pt-12 pb-24 space-y-6 md:space-y-8 max-w-6xl mx-auto transition-colors duration-300 px-4 sm:px-6">
      <div>
        <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mb-4 transition-colors">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Inbox</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage messages, orders, and volunteer applications.</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto no-scrollbar transition-colors">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 whitespace-nowrap ${
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
          <MessagesTab 
            messages={messages} processingId={processingId} 
            onUpdateStatus={(id, status) => handleUpdateStatus('messages', id, status)} 
            onReply={openReplyModal} onDelete={(id) => setDeleteModal({ isOpen: true, type: 'messages', id })} 
          />
        )}

        {activeTab === 'orders' && (
          <OrdersTab 
            orders={orders} processingId={processingId} 
            onUpdateStatus={(id, status) => handleUpdateStatus('orders', id, status)} 
            onReply={openReplyModal} onDelete={(id) => setDeleteModal({ isOpen: true, type: 'orders', id })} 
          />
        )}

        {activeTab === 'volunteers' && (
          <VolunteersTab 
            volunteers={volunteers} processingId={processingId} 
            onUpdateStatus={(id, status) => handleUpdateStatus('volunteers', id, status)} 
            onReply={openReplyModal} onDelete={(id) => setDeleteModal({ isOpen: true, type: 'volunteers', id })} 
          />
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={executeDelete}
        title={`Delete ${deleteModal.type === 'orders' ? 'Order' : deleteModal.type === 'volunteers' ? 'Application' : 'Message'}`}
        message={`Are you sure you want to delete this ${deleteModal.type === 'orders' ? 'order' : deleteModal.type === 'volunteers' ? 'application' : 'message'}? This action cannot be undone.`}
        confirmText="Delete"
      />

      <ReplyModal 
        isOpen={replyModal.isOpen}
        name={replyModal.name}
        email={replyModal.email}
        subject={replyModal.subject}
        replyText={replyText}
        sendingReply={sendingReply}
        onClose={() => setReplyModal({ ...replyModal, isOpen: false })}
        onSubjectChange={(val) => setReplyModal({...replyModal, subject: val})}
        onReplyTextChange={(val) => setReplyText(val)}
        onSend={executeReply}
      />
    </div>
  );
}
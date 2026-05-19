'use client';

import React, { useState, useEffect } from 'react';

interface IFAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  createdAt?: string;
}

const CATEGORIES = ['General', 'Product', 'Donation', 'Volunteer'];

export default function FAQsClient() {
  const [faqs, setFaqs] = useState<IFAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    isActive: true,
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/faqs');
      const json = await res.json();
      if (json.success) {
        setFaqs(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch FAQs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (faq?: IFAQ) => {
    if (faq) {
      setEditingId(faq._id);
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category || 'General',
        isActive: faq.isActive,
      });
    } else {
      setEditingId(null);
      setFormData({ question: '', answer: '', category: 'General', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingId ? `/api/admin/faqs/${editingId}` : '/api/admin/faqs';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (json.success) {
        await fetchFaqs();
        handleCloseModal();
        // Trigger Success Modal
        setSuccessMessage(editingId ? 'FAQ updated successfully!' : 'FAQ created successfully!');
      } else {
        alert(json.error || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/faqs/${deleteId}`, { method: 'DELETE' });
      const json = await res.json();
      
      if (json.success) {
        setFaqs(faqs.filter(faq => faq._id !== deleteId));
        setDeleteId(null);
        // Trigger Success Modal
        setSuccessMessage('FAQ deleted successfully!');
      } else {
        alert(json.error || 'Failed to delete FAQ');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getFaqsByCategory = (category: string) => {
    return faqs.filter(faq => faq.category === category);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 md:p-8 transition-colors relative">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Content Library</h2>
        <button
          onClick={() => handleOpenModal()}
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors text-center shadow-sm"
        >
          + Add New FAQ
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading FAQs...</div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          No FAQs found. Create your first one!
        </div>
      ) : (
        <div className="space-y-10">
          {CATEGORIES.map((category) => {
            const categoryFaqs = getFaqsByCategory(category);
            if (categoryFaqs.length === 0) return null;

            return (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-800 pb-2">
                  {category} Questions
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {categoryFaqs.map((faq) => (
                    <div key={faq._id} className="bg-gray-50 dark:bg-gray-800/50 p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-md font-bold shadow-sm ${
                            faq.isActive 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {faq.isActive ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                          {faq.question}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {faq.answer}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4 sm:border-l sm:border-gray-200 sm:dark:border-gray-700 sm:pl-4 sm:ml-2 pt-3 sm:pt-0 border-t border-gray-200 dark:border-gray-700 sm:border-t-0 shrink-0">
                        <button onClick={() => handleOpenModal(faq)} className="text-purple-600 dark:text-purple-400 hover:text-purple-700 text-sm font-semibold">
                          Edit
                        </button>
                        <button onClick={() => setDeleteId(faq._id)} className="text-red-600 dark:text-red-400 hover:text-red-700 text-sm font-semibold">
                          Delete
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-hidden">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-gray-900/50 rounded-t-2xl">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Edit FAQ' : 'Create New FAQ'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 -mr-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-5 md:p-6">
              <form id="faq-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Question</label>
                  <input
                    required
                    type="text"
                    value={formData.question}
                    onChange={(e) => setFormData({...formData, question: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 transition-shadow"
                    placeholder="e.g. How do I use the cup?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Answer</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.answer}
                    onChange={(e) => setFormData({...formData, answer: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 resize-y transition-shadow"
                    placeholder="Provide the detailed answer here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bucket Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-950 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2 pb-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <label htmlFor="isActive" className="text-base font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                    Visible on public site
                  </label>
                </div>
              </form>
            </div>

            <div className="p-5 md:p-6 border-t border-gray-100 dark:border-gray-800 shrink-0 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="faq-form"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
              >
                {isSubmitting ? 'Saving...' : 'Save FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-800 flex flex-col text-center">
            <div className="p-6 md:p-8">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete FAQ?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                This action cannot be undone. Are you sure you want to permanently delete this question?
              </p>
            </div>
            <div className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 rounded-b-2xl">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Success Feedback Modal */}
      {successMessage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-800 flex flex-col text-center">
            <div className="p-6 md:p-8">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Success!</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {successMessage}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 rounded-b-2xl">
              <button
                onClick={() => setSuccessMessage(null)}
                className="w-full px-4 py-2.5 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
              >
                Awesome
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
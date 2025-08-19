'use client';

import React, { useState } from 'react';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: '400' });

import useBlogPosts from './hooks/useBlogPosts';
import useAdminAuth from './hooks/useAdminAuth';
import useFilters from './hooks/useFilters';
import PostForm from './forms/PostForm';
import SearchAndFilter from './ui/SearchAndFilter';
import PostCard from './ui/PostCard';
import Pagination from './ui/Pagination';
import Modal from './ui/Modal';
import { RefreshCw, Plus } from 'lucide-react';
import { BlogPost } from './types';

const AdminBlogManager: React.FC = () => {
  const { adminToken, setAdminToken } = useAdminAuth();
  const { blogPosts, loading, error, fetchBlogPosts, handleCreate, handleUpdate, handleDelete, pagination, setPagination } = useBlogPosts(adminToken);
  const { filters, setFilters, filteredPosts, uniqueAuthors } = useFilters(blogPosts);
  const [creatingPost, setCreatingPost] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [viewingPost, setViewingPost] = useState<BlogPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 5000);
  };

  const nextPage = () => {
    if (pagination.page * pagination.limit < pagination.total) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const prevPage = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const emptyPost: Omit<BlogPost, '_id'> = {
    title: '',
    slug: '',
    author: '',
    heroImage: '',
    content: '',
    publishedDate: new Date().toISOString(),
    tags: [],
    status: 'draft',
  };

  return (
    <div className={`bg-gray-50 min-h-screen p-4 antialiased ${montserrat.className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-extrabold text-gray-900 text-center mb-8 tracking-tight">
            Enhanced Blog Admin Manager
          </h1>
          <div className="mb-8 bg-gray-100 p-6 rounded-xl shadow-inner">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-grow w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Token</label>
                <input
                  type="password"
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                  placeholder="Enter admin token"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  aria-label="Admin token"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={fetchBlogPosts}
                  disabled={loading}
                  className="w-full md:w-auto bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
                <button
                  onClick={() => setCreatingPost(true)}
                  className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <Plus size={16} />
                  New Post
                </button>
              </div>
            </div>
          </div>
          <SearchAndFilter filters={filters} onFiltersChange={setFilters} authors={uniqueAuthors} />
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading blog posts...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.length > 0 ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">
                      Showing {filteredPosts.length} of {blogPosts.length} posts
                    </p>
                  </div>
                  {filteredPosts.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit).map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onView={() => setViewingPost(post)}
                      onEdit={() => setEditingPost(post)}
                      onDelete={() => setPostToDelete(post)}
                    />
                  ))}
                  <Pagination
                    page={pagination.page}
                    total={pagination.total}
                    limit={pagination.limit}
                    onPrev={prevPage}
                    onNext={nextPage}
                  />
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {filters.query || filters.author || filters.status !== 'all'
                      ? 'No posts match your current filters.'
                      : 'No blog posts found. Click "New Post" to get started!'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
        {postToDelete && (
          <Modal
            title="Confirm Deletion"
            onClose={() => setPostToDelete(null)}
          >
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>&quot;{postToDelete.title}&quot;</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPostToDelete(null)}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete(postToDelete);
                  setPostToDelete(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors shadow-md font-medium"
              >
                Delete
              </button>
            </div>
          </Modal>
        )}
        {(editingPost || creatingPost) && (
          <PostForm
            post={editingPost || emptyPost}
            onSave={(post) => {
              if (creatingPost) handleCreate(post);
              else handleUpdate(post);
              setCreatingPost(false);
              setEditingPost(null);
            }}
            onCancel={() => {
              setCreatingPost(false);
              setEditingPost(null);
            }}
            isCreating={creatingPost}
          />
        )}
        {viewingPost && (
          <Modal
            title={viewingPost.title}
            onClose={() => setViewingPost(null)}
          >
            <div className="space-y-4 mb-6 text-sm text-gray-600">
              <p><strong>Author:</strong> {viewingPost.author || 'Unknown'}</p>
              <p><strong>Slug:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{viewingPost.slug}</span></p>
              <p><strong>Published:</strong> {new Date(viewingPost.publishedDate).toLocaleString()}</p>
              {viewingPost.tags && viewingPost.tags.length > 0 && (
                <div>
                  <strong className="block mb-2">Tags:</strong>
                  <div className="flex flex-wrap gap-2">
                    {viewingPost.tags.map((tag) => (
                      <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {viewingPost.heroImage && (
                <div>
                  <strong className="block mb-2">Hero Image:</strong>
                  <img
                    src={viewingPost.heroImage}
                    alt={`Hero image for ${viewingPost.title}`}
                    className="w-full h-auto rounded-lg shadow-md object-cover max-h-64"
                    onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                  />
                </div>
              )}
            </div>
            <div className="prose prose-lg max-w-none p-4 rounded-lg bg-gray-50 border border-gray-200">
              <div dangerouslySetInnerHTML={{ __html: viewingPost.content }} />
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setViewingPost(null)}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setEditingPost(viewingPost);
                  setViewingPost(null);
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-semibold"
              >
                Edit
              </button>
            </div>
          </Modal>
        )}
        {message && (
          <Modal title="Notification" onClose={() => setMessage(null)}>
            <p className="text-gray-700 mb-6">{message}</p>
            <div className="flex justify-end">
              <button
                onClick={() => setMessage(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
              >
                OK
              </button>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default AdminBlogManager;
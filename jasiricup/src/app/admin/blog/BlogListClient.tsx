// src/app/admin/blog/BlogListClient.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ConfirmModal, SuccessModal } from "@/components/ui/Modal";

interface IBlogListItem {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  publishedDate?: string | Date | null;
  featured: boolean;
  viewCount: number;
  createdAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function BlogListClient({
  initialBlogs,
}: {
  initialBlogs: IBlogListItem[];
}) {
  const [blogs, setBlogs] = useState<IBlogListItem[]>(initialBlogs);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '', title: '' });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isFirstRender = useRef(true);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        search: search,
        status: statusFilter,
        sortBy: "createdAt",
        sortDir: "desc",
      });

      const res = await fetch(`/api/admin/blog?${params}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setBlogs(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchBlogs();
  }, [fetchBlogs]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 400);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const confirmDelete = (id: string, title: string) => {
    setDeleteModal({ isOpen: true, id, title });
  };

  const executeDelete = async () => {
    if (!deleteModal.id) return;
    const idToDelete = deleteModal.id;

    setDeleteModal({ isOpen: false, id: '', title: '' });
    setProcessingId(idToDelete);

    const tid = toast.loading("Deleting post...");

    try {
      const res = await fetch(`/api/admin/blog/${idToDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setBlogs((prev) => prev.filter((b) => b._id !== idToDelete));

      toast.dismiss(tid);
      setSuccessModal({ isOpen: true, message: "Blog post deleted successfully!" });
    } catch {
      toast.error("Delete failed", { id: tid });
    } finally {
      setProcessingId(null);
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !current }),
      });
      if (!res.ok) throw new Error();

      setBlogs((prev) =>
        prev.map((b) => (b._id === id ? { ...b, featured: !current } : b)),
      );
      toast.success(current ? "Removed from featured" : "Featured!");
    } catch {
      toast.error("Update failed");
    } finally {
      setProcessingId(null);
    }
  };

  if (blogs.length === 0 && !search && !statusFilter) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 sm:p-12 text-center transition-colors w-full">
        <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-purple-500">✍️</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          No blog posts yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Get started by writing your first blog post.
        </p>
        <Link
          href="/admin/blog/create"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors shadow-sm"
        >
          Write New Post
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Top filters */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <input
          type="text"
          placeholder="Search by title, author, tag..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 min-w-0 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors w-full shadow-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors w-full sm:w-auto shadow-sm cursor-pointer"
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400"></div>
        </div>
      )}

      {!loading && blogs.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 text-center py-16 text-gray-500 dark:text-gray-400 text-sm shadow-sm w-full">
          No posts match your filters.
        </div>
      )}

      {!loading && blogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 w-full">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              // FIX: added min-w-0 — critical for preventing flex/grid children from overflowing
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 sm:p-5 hover:shadow-lg transition-all duration-300 group flex flex-col h-full hover:-translate-y-1 w-full min-w-0 overflow-hidden"
            >
              {/* Card Header */}
              {/* FIX: added min-w-0 to the flex row so children can shrink below content size */}
              <div className="flex justify-between items-start mb-3 w-full min-w-0 gap-2">

                {/* FIX: replaced w-[70%] with flex-1 min-w-0 — this is the key truncate fix */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight truncate block w-full">
                    {blog.title}
                  </h4>
                  <span className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 font-mono mt-1 block truncate w-full">
                    /{blog.slug}
                  </span>
                </div>

                {/* FIX: replaced w-[30%] with shrink-0 — badge is fixed size, never pushed out */}
                <div className="shrink-0">
                  <span
                    className={`inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border whitespace-nowrap ${
                      blog.status === "published"
                        ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    {blog.status}
                  </span>
                </div>
              </div>

              {/* Card Meta (Date, Views, Featured) */}
              <div className="flex items-center flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6 flex-grow w-full overflow-hidden">
                {blog.featured && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 uppercase tracking-wide shrink-0">
                    ⭐ Featured
                  </span>
                )}
                <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md shrink-0">
                  📅{" "}
                  {blog.status === "published" && blog.publishedDate
                    ? new Date(blog.publishedDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Not Published"}
                </span>
                <span className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md shrink-0">
                  👁️ {blog.viewCount || 0}
                </span>
              </div>

              {/* Card Actions */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 mt-auto w-full">
                <button
                  onClick={() => toggleFeatured(blog._id, blog.featured)}
                  disabled={processingId === blog._id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 whitespace-nowrap shrink-0 ${
                    blog.featured
                      ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                      : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {blog.featured ? "⭐ Unfeature" : "☆ Feature"}
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/blog/edit/${blog._id}`}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors whitespace-nowrap"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      confirmDelete(blog._id, blog.title);
                    }}
                    disabled={processingId === blog._id}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium transition-colors disabled:opacity-50 px-2 whitespace-nowrap"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 text-sm text-gray-500 dark:text-gray-400 transition-colors w-full">
          <span>
            {pagination.total} post{pagination.total !== 1 ? "s" : ""} total
          </span>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex-wrap justify-center">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={!pagination.hasPrev || loading}
              className="px-4 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Prev
            </button>
            <span className="px-4 py-1.5 font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pagination.hasNext || loading}
              className="px-4 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: '', title: '' })}
        onConfirm={executeDelete}
        title="Delete Blog Post"
        message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
        confirmText="Delete Post"
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        title="Success"
        message={successModal.message}
      />
    </div>
  );
}
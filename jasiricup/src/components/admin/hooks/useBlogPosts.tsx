import { useState, useEffect, useCallback } from 'react';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  author?: string;
  heroImage: string;
  content: string;
  publishedDate: string;
  tags?: string[];
  status: 'draft' | 'published';
}

const useBlogPosts = (adminToken: string) => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0 });

  const fetchBlogPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/blog?page=${pagination.page}&limit=${pagination.limit}`, {
        headers: {
          'X-Admin-Token': adminToken,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      const { data, total } = await response.json();
      setBlogPosts(data);
      setPagination((prev) => ({ ...prev, total }));
      setError(null);
    } catch (err: any) {
      setError(`Failed to fetch blog posts: ${err.message}`);
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  }, [adminToken, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchBlogPosts();
  }, [fetchBlogPosts]);

  const handleCreate = async (newPost: Omit<BlogPost, '_id'>) => {
    if (!adminToken) {
      return { success: false, message: 'Please enter a valid admin token to create a post.' };
    }
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify(newPost),
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      const { data } = await response.json();
      setBlogPosts((prevPosts) => [...prevPosts, data]);
      return { success: true, message: 'Blog post created successfully!' };
    } catch (err: any) {
      return { success: false, message: `Failed to create blog post: ${err.message}` };
    }
  };

  const handleUpdate = async (updatedPost: Partial<BlogPost>) => {
    if (!adminToken) {
      return { success: false, message: 'Please enter a valid admin token to update a post.' };
    }
    try {
      const response = await fetch(`/api/blog/${updatedPost._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
        body: JSON.stringify(updatedPost),
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      const { data } = await response.json();
      setBlogPosts((prevPosts) => prevPosts.map((post) => (post._id === data._id ? data : post)));
      return { success: true, message: 'Blog post updated successfully!' };
    } catch (err: any) {
      return { success: false, message: `Failed to update blog post: ${err.message}` };
    }
  };

  const handleDelete = async (post: BlogPost) => {
    if (!adminToken) {
      return { success: false, message: 'Please enter a valid admin token to delete a post.' };
    }
    try {
      const response = await fetch(`/api/blog/${post._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': adminToken,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${await response.text()}`);
      }
      setBlogPosts((prevPosts) => prevPosts.filter((p) => p._id !== post._id));
      return { success: true, message: 'Blog post deleted successfully!' };
    } catch (err: any) {
      return { success: false, message: `Failed to delete blog post: ${err.message}` };
    }
  };

  return { blogPosts, loading, error, fetchBlogPosts, handleCreate, handleUpdate, handleDelete, pagination, setPagination };
};

export default useBlogPosts;
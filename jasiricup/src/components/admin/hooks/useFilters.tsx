import { useState, useEffect } from 'react';

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

interface SearchFilters {
  query: string;
  author: string;
  status: 'all' | 'draft' | 'published';
  sortBy: 'date' | 'title' | 'author';
  sortOrder: 'asc' | 'desc';
}

const useFilters = (blogPosts: BlogPost[]) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    author: '',
    status: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    let filtered = [...blogPosts];

    // Apply search query filter
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.author?.toLowerCase().includes(query) ||
          post.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply author filter
    if (filters.author) {
      filtered = filtered.filter((post) => post.author === filters.author);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter((post) => post.status === filters.status);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'author':
          aValue = (a.author || '').toLowerCase();
          bValue = (b.author || '').toLowerCase();
          break;
        case 'date':
        default:
          aValue = new Date(a.publishedDate).getTime();
          bValue = new Date(b.publishedDate).getTime();
          break;
      }
      return filters.sortOrder === 'desc' ? (aValue > bValue ? -1 : 1) : aValue < bValue ? -1 : 1;
    });

    setFilteredPosts(filtered);
  }, [blogPosts, filters]);

  const uniqueAuthors = Array.from(new Set(blogPosts.map((post) => post.author).filter((author): author is string => Boolean(author))));

  return { filters, setFilters, filteredPosts, uniqueAuthors };
};

export default useFilters;
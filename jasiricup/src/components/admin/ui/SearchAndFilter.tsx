import React from 'react';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: '400' });
import { Search, SortAsc, SortDesc } from 'lucide-react';

interface SearchFilters {
  query: string;
  author: string;
  status: 'all' | 'draft' | 'published';
  sortBy: 'date' | 'title' | 'author';
  sortOrder: 'asc' | 'desc';
}

interface SearchAndFilterProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  authors: string[];
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({ filters, onFiltersChange, authors }) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 ${montserrat.className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => onFiltersChange({ ...filters, query: e.target.value })}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search posts"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
          <select
            value={filters.author}
            onChange={(e) => onFiltersChange({ ...filters, author: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by author"
          >
            <option value="">All Authors</option>
            {authors.map((author) => (
              <option key={author} value={author}>
                {author}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as 'all' | 'draft' | 'published' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <div className="flex gap-2">
            <select
              value={filters.sortBy}
              onChange={(e) => onFiltersChange({ ...filters, sortBy: e.target.value as 'date' | 'title' | 'author' })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Sort by"
            >
              <option value="date">Date</option>
              <option value="title">Title</option>
              <option value="author">Author</option>
            </select>
            <button
              onClick={() =>
                onFiltersChange({
                  ...filters,
                  sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              aria-label="Toggle sort order"
            >
              {filters.sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter;
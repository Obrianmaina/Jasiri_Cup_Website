import React from 'react';
import { BlogPost } from '../types';

interface PostFormFieldsProps {
  formData: Omit<BlogPost, '_id'>;
  onChange: (field: keyof Omit<BlogPost, '_id'>, value: any) => void;
  onTagsChange: (value: string) => void;
  tags: string;
  errors: { [key: string]: string };
}

const PostFormFields: React.FC<PostFormFieldsProps> = ({ formData, onChange, onTagsChange, tags, errors }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="title">
          Title *
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder="Enter post title"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          aria-required="true"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="slug">
          Slug *
        </label>
        <input
          id="slug"
          type="text"
          value={formData.slug}
          onChange={(e) => onChange('slug', e.target.value)}
          placeholder="Enter post slug"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          aria-required="true"
        />
        {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="author">
          Author
        </label>
        <input
          id="author"
          type="text"
          value={formData.author || ''}
          onChange={(e) => onChange('author', e.target.value)}
          placeholder="Enter author name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="heroImage">
          Hero Image URL
        </label>
        <input
          id="heroImage"
          type="text"
          value={formData.heroImage}
          onChange={(e) => onChange('heroImage', e.target.value)}
          placeholder="Enter hero image URL"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {errors.heroImage && <p className="text-red-500 text-sm mt-1">{errors.heroImage}</p>}
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="publishedDate">
          Published Date
        </label>
        <input
          id="publishedDate"
          type="datetime-local"
          value={formData.publishedDate ? new Date(formData.publishedDate).toISOString().slice(0, 16) : ''}
          onChange={(e) => onChange('publishedDate', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="tags">
          Tags
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder="Enter tags, separated by commas"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="status">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => onChange('status', e.target.value as 'draft' | 'published')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>
    </div>
  );
};

export default PostFormFields;
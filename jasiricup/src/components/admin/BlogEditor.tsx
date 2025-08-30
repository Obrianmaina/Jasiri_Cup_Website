// src/components/admin/BlogEditor.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';

interface BlogPost {
  _id?: string;
  title: string;
  slug: string;
  author: string;
  heroImage: string;
  content: string;
  metaDescription: string;
  tags: string[];
  status: 'draft' | 'published';
  featured: boolean;
}

interface BlogEditorProps {
  initialData?: Partial<BlogPost>;
  onSave: (data: BlogPost) => Promise<void>;
  saving: boolean;
}

export const BlogEditor = ({ initialData, onSave, saving }: BlogEditorProps) => {
  const [formData, setFormData] = useState<BlogPost>({
    title: initialData?.title || '',
    slug: initialData?.slug || '',
    author: initialData?.author || 'Admin',
    heroImage: initialData?.heroImage || '',
    content: initialData?.content || '',
    metaDescription: initialData?.metaDescription || '',
    tags: initialData?.tags || [],
    status: initialData?.status || 'draft',
    featured: initialData?.featured || false,
    ...initialData
  });

  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, heroImage: data.url }));
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    const newText = before + selectedText + after;
    const newContent = 
      textarea.value.substring(0, start) + 
      newText + 
      textarea.value.substring(end);

    setFormData(prev => ({ ...prev, content: newContent }));

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault();
    await onSave({ ...formData, status });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <form className="space-y-6">
        {/* Title */}
        <div>
          <Input
            id="title"
            name="title"
            label="Title*"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Enter blog post title"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <Input
            id="slug"
            name="slug"
            label="URL Slug*"
            value={formData.slug}
            onChange={handleInputChange}
            placeholder="url-friendly-slug"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            URL: /blog/{formData.slug}
          </p>
        </div>

        {/* Author and Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="author"
            name="author"
            label="Author"
            value={formData.author}
            onChange={handleInputChange}
            placeholder="Author name"
          />
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="mr-2"
              />
              Featured Post
            </label>
          </div>
        </div>

        {/* Hero Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Image
          </label>
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
            {uploading && <p className="text-sm text-blue-600">Uploading...</p>}
            {formData.heroImage && (
              <div className="mt-2">
                <img
                  src={formData.heroImage}
                  alt="Hero preview"
                  className="max-w-xs h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Content Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content*
          </label>
          
          {/* Formatting Toolbar */}
          <div className="border border-gray-300 rounded-t-lg p-2 bg-gray-50 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => insertFormatting('<h2>', '</h2>')}
              className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('<h3>', '</h3>')}
              className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('<strong>', '</strong>')}
              className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100 font-bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('<em>', '</em>')}
              className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100 italic"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('<p>', '</p>')}
              className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100"
            >
              P
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('<ul>\n<li>', '</li>\n</ul>')}
              className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100"
            >
              UL
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('<a href="">', '</a>')}
              className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100"
            >
              Link
            </button>
          </div>

          <textarea
            ref={contentRef}
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={20}
            className="w-full border border-t-0 border-gray-300 rounded-b-lg p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            placeholder="Write your blog content here using HTML tags..."
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Use HTML tags for formatting. Preview will be available after saving.
          </p>
        </div>

        {/* Meta Description */}
        <div>
          <TextArea
            id="metaDescription"
            name="metaDescription"
            label="Meta Description"
            value={formData.metaDescription}
            onChange={handleInputChange}
            placeholder="Brief description for SEO (recommended: 150-160 characters)"
            rows={3}
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.metaDescription.length}/160 characters
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag"
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Button type="button" onClick={addTag} variant="secondary" size="small">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={saving}
            variant="secondary"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={saving}
            variant="primary"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </form>
    </div>
  );
};
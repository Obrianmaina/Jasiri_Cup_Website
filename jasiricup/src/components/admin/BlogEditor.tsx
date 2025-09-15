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
  const [uploadError, setUploadError] = useState<string>('');
  const [showToolbar, setShowToolbar] = useState(true);
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use the correct admin upload endpoint
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, heroImage: data.url }));
        setUploadError('');
      } else {
        throw new Error(data.error || 'Upload failed - no URL returned');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const removeCurrentImage = () => {
    setFormData(prev => ({ ...prev, heroImage: '' }));
    setUploadError('');
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 sm:p-6">
      <form className="space-y-4 sm:space-y-6">
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
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            URL: /blog/{formData.slug}
          </p>
        </div>

        {/* Author and Meta - Mobile stacked */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="author"
            name="author"
            label="Author"
            value={formData.author}
            onChange={handleInputChange}
            placeholder="Author name"
          />
          <div className="flex items-center space-x-4 pt-6 sm:pt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="mr-2 h-4 w-4"
              />
              <span className="text-sm sm:text-base">Featured Post</span>
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
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-2 sm:file:mr-4 file:py-2 file:px-2 sm:file:px-4 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50"
            />
            
            {/* Upload Status */}
            {uploading && (
              <div className="flex items-center text-xs sm:text-sm text-blue-600">
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600 mr-2"></div>
                Uploading to Cloudinary...
              </div>
            )}
            
            {/* Upload Error */}
            {uploadError && (
              <div className="text-xs sm:text-sm text-red-600 bg-red-50 p-2 rounded">
                {uploadError}
              </div>
            )}
            
            {/* Current Image Preview */}
            {formData.heroImage && formData.heroImage.trim() && (
              <div className="mt-2">
                <div className="relative inline-block">
                  <img
                    src={formData.heroImage}
                    alt="Hero preview"
                    className="w-full sm:max-w-xs h-32 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={removeCurrentImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Image uploaded successfully
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content Editor */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Content*
            </label>
            <button
              type="button"
              onClick={() => setShowToolbar(!showToolbar)}
              className="text-xs text-purple-600 hover:text-purple-800 sm:hidden"
            >
              {showToolbar ? 'Hide Tools' : 'Show Tools'}
            </button>
          </div>
          
          {/* Formatting Toolbar - Responsive */}
          <div className={`border border-gray-300 rounded-t-lg p-2 bg-gray-50 ${showToolbar ? 'block' : 'hidden sm:block'}`}>
            <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => insertFormatting('<h2>', '</h2>')}
                className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<h3>', '</h3>')}
                className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<strong>', '</strong>')}
                className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 font-bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<em>', '</em>')}
                className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<p>', '</p>')}
                className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100"
              >
                P
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<ul>\n<li>', '</li>\n</ul>')}
                className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100"
              >
                UL
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<a href="">', '</a>')}
                className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100"
              >
                Link
              </button>
            </div>
          </div>

          <textarea
            ref={contentRef}
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={15}
            className={`w-full border ${showToolbar ? 'border-t-0 rounded-b-lg' : 'rounded-lg'} border-gray-300 p-3 sm:p-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-xs sm:text-sm`}
            placeholder="Write your blog content here using HTML tags..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
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
          <p className="text-xs text-gray-500 mt-1">
            {formData.metaDescription.length}/160 characters
          </p>
        </div>

        {/* Tags - Mobile optimized */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add a tag"
              className="flex-1 border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
            <Button type="button" onClick={addTag} variant="secondary" size="small" className="w-full sm:w-auto">
              Add Tag
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 sm:ml-2 text-purple-600 hover:text-purple-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit Buttons - Mobile optimized */}
        <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6">
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={saving}
            variant="secondary"
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={saving}
            variant="primary"
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </form>
    </div>
  );
};
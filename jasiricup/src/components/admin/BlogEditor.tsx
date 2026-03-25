// src/components/admin/BlogEditor.tsx
'use client';

import { useState, useRef } from 'react';
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

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

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
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <form className="space-y-8">
        
        {/* Basic Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              id="title"
              name="title"
              label="Article Title*"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Enter a captivating title"
              required
            />
          </div>

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
            <p className="text-xs text-gray-400 mt-1.5 font-mono">
              /blog/{formData.slug || 'slug'}
            </p>
          </div>

          <div>
            <Input
              id="author"
              name="author"
              label="Author Name"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Who wrote this?"
            />
          </div>
        </div>

        {/* Hero Image Section */}
        <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-gray-700">
              Hero Image
            </label>
            <label className="flex items-center mt-2 sm:mt-0 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="mr-2 h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">Feature this post on home page</span>
            </label>
          </div>
          
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:opacity-50 transition-colors cursor-pointer"
            />
            
            {uploading && (
              <div className="flex items-center text-sm text-purple-600 font-medium">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                Uploading securely...
              </div>
            )}
            
            {uploadError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                {uploadError}
              </div>
            )}
            
            {formData.heroImage && formData.heroImage.trim() && (
              <div className="relative inline-block mt-2 group">
                <img
                  src={formData.heroImage}
                  alt="Hero preview"
                  className="w-full sm:max-w-md h-48 object-cover rounded-xl border border-gray-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={removeCurrentImage}
                  className="absolute -top-3 -right-3 bg-white border border-gray-200 text-red-500 rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-50 hover:text-red-600 shadow-sm transition-all"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Editor Section */}
        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              Markdown Content*
            </label>
            <button
              type="button"
              onClick={() => setShowToolbar(!showToolbar)}
              className="text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors sm:hidden"
            >
              {showToolbar ? 'Hide Formatting' : 'Show Formatting'}
            </button>
          </div>
          
          <div className="flex flex-col shadow-sm rounded-xl">
            <div className={`border border-gray-200 border-b-0 rounded-t-xl p-2 bg-gray-50/50 ${showToolbar ? 'block' : 'hidden sm:block'}`}>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'H2', before: '## ' },
                  { label: 'H3', before: '### ' },
                  { label: 'Bold', before: '**', after: '**' },
                  { label: 'Italic', before: '*', after: '*' },
                  { label: 'Quote', before: '> ' },
                  { label: 'List', before: '- ' },
                  { label: 'Link', before: '[', after: '](https://)' }
                ].map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => insertFormatting(btn.before, btn.after)}
                    className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-colors"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              ref={contentRef}
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={16}
              className={`w-full border-gray-200 focus:ring-purple-500 focus:border-purple-500 font-mono text-sm leading-relaxed p-4 ${showToolbar ? 'rounded-b-xl' : 'rounded-xl'}`}
              placeholder="Write your blog content here using Markdown syntax..."
              required
            />
          </div>
        </div>

        {/* Meta & Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <TextArea
              id="metaDescription"
              name="metaDescription"
              label="Meta Description (SEO)"
              value={formData.metaDescription}
              onChange={handleInputChange}
              placeholder="Brief description for search engines..."
              rows={4}
            />
            <div className="flex justify-end mt-1">
              <span className={`text-xs ${formData.metaDescription.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                {formData.metaDescription.length}/160
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Categories & Tags
            </label>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="e.g. Education, Health"
                className="flex-1 border-gray-200 rounded-xl px-4 py-2.5 focus:ring-purple-500 focus:border-purple-500 text-sm"
              />
              <Button type="button" onClick={addTag} variant="secondary" className="whitespace-nowrap rounded-xl">
                Add Tag
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded-xl border border-gray-100">
              {formData.tags.length === 0 && (
                <span className="text-sm text-gray-400 flex items-center px-2">No tags added yet.</span>
              )}
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-white border border-purple-100 text-purple-700 shadow-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-purple-400 hover:text-red-500 hover:bg-red-50 rounded-md p-0.5 transition-colors"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            disabled={saving}
            variant="secondary"
            className="w-full sm:w-auto rounded-xl py-2.5 font-semibold"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button
            type="button"
            onClick={(e) => handleSubmit(e, 'published')}
            disabled={saving}
            variant="primary"
            className="w-full sm:w-auto rounded-xl py-2.5 font-semibold bg-purple-600 hover:bg-purple-700"
          >
            {saving ? 'Publishing...' : 'Publish Post'}
          </Button>
        </div>
      </form>
    </div>
  );
};
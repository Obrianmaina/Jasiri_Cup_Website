import React, { useState, useEffect, useCallback } from 'react';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: '400' });
import { X, Save } from 'lucide-react';
import PostFormFields from './PostFormFields';
import BlockEditor from '../editor/BlockEditor';
import { validatePost } from '../utils/validation';
import { BlogPost } from '../types';

interface PostFormProps {
  post: Omit<BlogPost, '_id'> | BlogPost;
  onSave: (post: Omit<BlogPost, '_id'>) => void;
  onCancel: () => void;
  isCreating: boolean;
}

const PostForm: React.FC<PostFormProps> = ({ post, onSave, onCancel, isCreating }) => {
  const [formData, setFormData] = useState<Omit<BlogPost, '_id'>>({
    title: post.title || '',
    slug: post.slug || '',
    author: post.author || '',
    heroImage: post.heroImage || '',
    content: post.content || '',
    publishedDate: post.publishedDate || new Date().toISOString(),
    tags: post.tags || [],
    status: post.status || 'draft',
  });
  const [tags, setTags] = useState<string>(post.tags?.join(', ') || '');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    console.log('PostForm post:', post); // Debug log
    console.log('PostForm formData.content:', formData.content); // Debug content
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      author: post.author || '',
      heroImage: post.heroImage || '',
      content: post.content || '',
      publishedDate: post.publishedDate || new Date().toISOString(),
      tags: post.tags || [],
      status: post.status || 'draft',
    });
    setTags(post.tags?.join(', ') || '');
  }, [post]);

  const handleChange = useCallback((field: keyof Omit<BlogPost, '_id'>, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleTagsChange = useCallback((value: string) => {
    setTags(value);
    const tagArray = value.split(',').map((tag) => tag.trim()).filter((tag) => tag);
    handleChange('tags', tagArray);
  }, [handleChange]);

  const handleSubmit = () => {
    const validationErrors = validatePost(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSave(formData);
  };

  return (
    <div className={`fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto ${montserrat.className}`} role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl p-8 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto shadow-2xl" role="document">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold text-gray-800">{isCreating ? 'Create New Blog Post' : 'Edit Blog Post'}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close form"
          >
            <X size={28} />
          </button>
        </div>
        <div className="space-y-6">
          <PostFormFields
            formData={formData}
            onChange={handleChange}
            onTagsChange={handleTagsChange}
            tags={tags}
            errors={errors}
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Content *</label>
            <BlockEditor
              initialContent={formData.content}
              onChange={(html) => handleChange('content', html)}
            />
            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors flex items-center gap-2 font-semibold"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-semibold shadow-md"
          >
            <Save size={16} />
            {isCreating ? 'Create Post' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostForm;
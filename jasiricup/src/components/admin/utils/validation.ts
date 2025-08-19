import { BlogPost } from '../types';

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const validatePost = (post: Partial<Omit<BlogPost, '_id'>>): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};
  if (!post.title?.trim()) {
    errors.title = 'Title is required';
  } else if (post.title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  }
  if (!post.slug?.trim()) {
    errors.slug = 'Slug is required';
  } else if (!/^[a-z0-9-]+$/.test(post.slug)) {
    errors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
  }
  if (!post.content?.trim() || post.content === '<p></p>') {
    errors.content = 'Content is required';
  }
  return errors;
};

const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};
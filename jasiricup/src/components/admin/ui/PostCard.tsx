import React from 'react';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: '400' });
import { Eye, Edit3, Trash2, User, Hash, Calendar } from 'lucide-react';

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

const getContentPreview = (content: string, maxLength = 100) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const text = tempDiv.textContent || tempDiv.innerText || '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

interface PostCardProps {
  post: BlogPost;
  onView: (post: BlogPost) => void;
  onEdit: (post: BlogPost) => void;
  onDelete: (post: BlogPost) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onView, onEdit, onDelete }) => {
  const statusColor = post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 ${montserrat.className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between">
        <div className="flex-grow mb-4 lg:mb-0">
          <div className="flex items-start gap-3 mb-2">
            <h3 className="text-2xl font-bold text-gray-800 flex-1">{post.title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>{post.status}</span>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="flex items-center gap-2">
              <User size={14} />
              By: <span className="font-medium">{post.author || 'Unknown'}</span>
            </p>
            <p className="flex items-center gap-2">
              <Hash size={14} />
              Slug: <span className="font-mono bg-gray-100 px-1 rounded">{post.slug}</span>
            </p>
            <p className="flex items-center gap-2">
              <Calendar size={14} />
              Published: {new Date(post.publishedDate).toLocaleDateString()}
            </p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span className="text-xs font-medium text-gray-500">Tags:</span>
                {post.tags.map((tag) => (
                  <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <p className="italic text-gray-500 mt-2">{getContentPreview(post.content)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onView(post)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors shadow-md"
            title="View"
            aria-label="View post"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={() => onEdit(post)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-lg transition-colors shadow-md"
            title="Edit"
            aria-label="Edit post"
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={() => onDelete(post)}
            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors shadow-md"
            title="Delete"
            aria-label="Delete post"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
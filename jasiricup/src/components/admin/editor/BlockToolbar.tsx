import React from 'react';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: '400' });
import { Plus } from 'lucide-react';

interface BlockToolbarProps {
  onAddBlock: (type: 'text' | 'heading' | 'image' | 'list' | 'quote') => void;
}

const BlockToolbar: React.FC<BlockToolbarProps> = ({ onAddBlock }) => {
  return (
    <div className={`bg-gray-50 border-b border-gray-300 p-3 flex gap-3 flex-wrap ${montserrat.className}`}>
      <button
        onClick={() => onAddBlock('heading')}
        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium"
      >
        <Plus size={16} /> Add Subheading
      </button>
      <button
        onClick={() => onAddBlock('text')}
        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium"
      >
        <Plus size={16} /> Add Paragraph
      </button>
      <button
        onClick={() => onAddBlock('image')}
        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium"
      >
        <Plus size={16} /> Add Image
      </button>
      <button
        onClick={() => onAddBlock('list')}
        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium"
      >
        <Plus size={16} /> Add List
      </button>
      <button
        onClick={() => onAddBlock('quote')}
        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium"
      >
        <Plus size={16} /> Add Quote
      </button>
    </div>
  );
};

export default BlockToolbar;
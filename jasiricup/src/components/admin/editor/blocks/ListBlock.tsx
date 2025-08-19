import React, { useState } from 'react';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: '400' });
import { Trash2 } from 'lucide-react';

interface ListBlockProps {
  content: { type: 'bullet' | 'ordered'; items: string[] };
  onChange: (content: { type: 'bullet' | 'ordered'; items: string[] }) => void;
  onRemove: () => void;
}

const ListBlock: React.FC<ListBlockProps> = ({ content = { type: 'bullet', items: [] }, onChange, onRemove }) => {
  const [type, setType] = useState(content.type);
  const [items, setItems] = useState(content.items.join('\n'));

  const handleChange = () => {
    const itemArray = items.split('\n').filter(Boolean);
    onChange({ type, items: itemArray });
  };

  return (
    <div className={`p-4 border-b border-gray-200 flex flex-col gap-2 ${montserrat.className}`}>
      <select
        value={type}
        onChange={(e) => {
          setType(e.target.value as 'bullet' | 'ordered');
          handleChange();
        }}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="bullet">Bullet List</option>
        <option value="ordered">Ordered List</option>
      </select>
      <textarea
        value={items}
        onChange={(e) => {
          setItems(e.target.value);
          handleChange();
        }}
        className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter list items, one per line..."
      />
      <button
        onClick={onRemove}
        className="self-end p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default ListBlock;
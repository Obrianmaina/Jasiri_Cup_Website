import React, { useState } from 'react';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: '400' });
import { Trash2 } from 'lucide-react';

interface TextBlockProps {
  content: string;
  onChange: (content: string) => void;
  onRemove: () => void;
}

const TextBlock: React.FC<TextBlockProps> = ({ content, onChange, onRemove }) => {
  const [value, setValue] = useState(content);

  return (
    <div className={`p-4 border-b border-gray-200 flex flex-col gap-2 ${montserrat.className}`}>
      <textarea
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter paragraph text..."
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

export default TextBlock;
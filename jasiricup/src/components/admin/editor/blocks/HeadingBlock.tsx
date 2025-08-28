import React, { useState, useEffect } from 'react';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: '400' });
import { Trash2 } from 'lucide-react';

interface HeadingBlockProps {
  content: { level: number; text: string };
  onChange: (content: { level: number; text: string }) => void;
  onRemove: () => void;
}

const HeadingBlock: React.FC<HeadingBlockProps> = ({ content = { level: 2, text: '' }, onChange, onRemove }) => {
  const [level, setLevel] = useState(content.level || 2);
  const [text, setText] = useState(content.text || '');

  // Sync with prop changes
  useEffect(() => {
    if (content.level !== level) setLevel(content.level || 2);
    if (content.text !== text) setText(content.text || '');
  }, [content.level, content.text]);

  const handleLevelChange = (newLevel: number) => {
    setLevel(newLevel);
    onChange({ level: newLevel, text });
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    onChange({ level, text: newText });
  };

  return (
    <div className={`p-4 border-b border-gray-200 flex flex-col gap-2 ${montserrat.className}`}>
      <div className="flex gap-2">
        <select
          value={level}
          onChange={(e) => handleLevelChange(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
        </select>
        <input
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter heading text..."
        />
      </div>
      <button
        onClick={onRemove}
        className="self-end p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

export default HeadingBlock;

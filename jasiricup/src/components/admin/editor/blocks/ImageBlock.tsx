import React, { useState } from 'react';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: '400' });
import { Trash2 } from 'lucide-react';
import ImageUpload from '../../ui/ImageUpload';

interface ImageBlockProps {
  content: { src: string; alt?: string };
  onChange: (content: { src: string; alt?: string }) => void;
  onRemove: () => void;
}

const ImageBlock: React.FC<ImageBlockProps> = ({ content = { src: '', alt: '' }, onChange, onRemove }) => {
  const [src, setSrc] = useState(content.src);
  const [alt, setAlt] = useState(content.alt || '');

  const handleUpload = (url: string) => {
    setSrc(url);
    onChange({ src: url, alt });
  };

  return (
    <div className={`p-4 border-b border-gray-200 flex flex-col gap-2 ${montserrat.className}`}>
      <ImageUpload onImageUploaded={handleUpload} />
      {src && (
        <img
          src={src}
          alt={alt}
          className="max-w-full h-auto rounded-lg border border-gray-200"
          onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
        />
      )}
      <input
        value={alt}
        onChange={(e) => {
          setAlt(e.target.value);
          onChange({ src, alt: e.target.value });
        }}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Enter alt text..."
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

export default ImageBlock;
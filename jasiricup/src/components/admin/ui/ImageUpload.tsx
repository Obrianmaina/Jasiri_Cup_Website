'use client';

import React, { useState, useRef } from 'react';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: '400' });
import { Upload, RefreshCw } from 'lucide-react';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  className?: string;
}

interface UploadResponse {
  url?: string;
  error?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUploaded, className = '' }) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData: UploadResponse = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }
      
      const result: UploadResponse = await response.json();
      
      if (!result.url) {
        throw new Error('No URL returned from server');
      }
      
      onImageUploaded(result.url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to upload image: ${errorMessage}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={`flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium ${montserrat.className} ${className}`}
      >
        {uploading ? (
          <RefreshCw size={16} className="animate-spin" />
        ) : (
          <Upload size={16} />
        )}
        {uploading ? 'Uploading...' : 'Upload Image'}
      </button>
    </>
  );
};

export default ImageUpload;
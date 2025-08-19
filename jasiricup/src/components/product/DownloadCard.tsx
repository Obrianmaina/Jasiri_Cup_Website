import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaDownload } from 'react-icons/fa'; // Using react-icons for download icon

interface DownloadCardProps {
  title: string;
  description: string;
  icon: string; // Path to SVG or image icon
  downloadLink?: string; // Optional link for download
}

export const DownloadCard = ({ title, description, icon, downloadLink }: DownloadCardProps) => {
  return (
    <div className='px-4 py-8 md:px-16 md:py-16'>
      <div className="text-white rounded-lg p-4 md:p-6 shadow-md flex flex-col items-center text-center" style={{ backgroundColor: '#7856BF' }}>
        <div className="mb-3 md:mb-4">
          {/* Responsive icon sizing */}
          <FaDownload size={24} className="text-white md:w-8 md:h-8" />
        </div>
        
        <h3 className="text-lg md:text-xl font-bold mb-2 leading-tight">{title}</h3>
        
        <p className="text-xs md:text-sm text-white mb-3 md:mb-4 leading-relaxed max-w-xs md:max-w-none">
          {description}
        </p>
        
        {downloadLink && (
          <Link 
            href={downloadLink} 
            className="inline-block bg-white text-purple-700 px-4 py-2 md:px-6 md:py-3 rounded-full text-xs md:text-sm font-medium hover:bg-gray-100 transition-colors active:bg-gray-200 min-w-[100px] md:min-w-[120px]"
          >
            Download
          </Link>
        )}
      </div>
    </div>
  );
};
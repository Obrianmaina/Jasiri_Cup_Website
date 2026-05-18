import React from 'react';
import Link from 'next/link';
import { FaDownload } from 'react-icons/fa';

interface DownloadCardProps {
  title: string;
  description: string;
  icon: string; 
  downloadLink?: string; 
}

export const DownloadCard = ({ title, description, icon, downloadLink }: DownloadCardProps) => {
  return (
    <div 
      className="text-white rounded-xl p-6 sm:p-8 shadow-md flex flex-col items-center text-center h-full transition-transform hover:-translate-y-1 hover:shadow-lg duration-300" 
      style={{ backgroundColor: '#7856BF' }}
    >
      <div className="mb-4 bg-white/20 p-4 rounded-full">
        <FaDownload size={20} className="text-white" />
      </div>
      
      <h3 className="text-lg md:text-xl font-bold mb-3 leading-tight">{title}</h3>
      
      {/* flex-grow pushes the button to the bottom if text lengths vary */}
      <p className="text-sm text-purple-50 mb-6 leading-relaxed flex-grow">
        {description}
      </p>
      
      {downloadLink && (
        <Link 
          href={downloadLink} 
          className="mt-auto inline-block bg-white text-purple-700 px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors active:bg-gray-200 shadow-sm w-full sm:w-auto"
        >
          Download
        </Link>
      )}
    </div>
  );
};
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
    <div className="bg-purple-700 text-white rounded-lg p-6 shadow-md flex flex-col items-center text-center">
      <div className="mb-4">
        {/* You can replace this with an actual SVG icon if desired */}
        <FaDownload size={40} className="text-white" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-200 mb-4">{description}</p>
      {downloadLink && (
        <Link href={downloadLink} className="inline-block bg-white text-purple-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors">
          Download
        </Link>
      )}
    </div>
  );
};

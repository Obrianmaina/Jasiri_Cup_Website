import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';

export const SocialLinks = ({ className = '' }) => {
  return (
    <div className={`flex space-x-4 ${className}`}>
      <a
        href="https://www.facebook.com/JasiriCup" // Example Facebook link
        className="text-gray-400 hover:text-blue-600 transition-colors" // Hover color for Facebook
        target="_blank" // Opens in a new tab
        rel="noopener noreferrer" // Security best practice
      >
        <FaFacebookF size={20} />
      </a>
      <a
        href="https://www.instagram.com/JasiriCup" // Example Instagram link
        className="text-gray-400 hover:text-pink-600 transition-colors" // Hover color for Instagram (often a gradient, but pink is common)
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaInstagram size={20} />
      </a>
      <a
        href="https://www.linkedin.com/company/JasiriCup" // Example LinkedIn link
        className="text-gray-400 hover:text-blue-700 transition-colors" // Hover color for LinkedIn
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaLinkedinIn size={20} />
      </a>
      <a
        href="https://www.youtube.com/JasiriCup" // Example YouTube link
        className="text-gray-400 hover:text-red-600 transition-colors" // Hover color for YouTube
        target="_blank"
        rel="noopener noreferrer"
      >
        <FaYoutube size={20} />
      </a>
    </div>
  );
};

import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';

export const SocialLinks = ({ className = '' }) => {
  return (
    <div className={`flex space-x-4 ${className}`}>
      <a href="#" className="text-gray-400 hover:text-white transition-colors">
        <FaFacebookF size={20} />
      </a>
      <a href="#" className="text-gray-400 hover:text-white transition-colors">
        <FaInstagram size={20} />
      </a>
      <a href="#" className="text-gray-400 hover:text-white transition-colors">
        <FaLinkedinIn size={20} />
      </a>
      <a href="#" className="text-gray-400 hover:text-white transition-colors">
        <FaYoutube size={20} />
      </a>
    </div>
  );
};

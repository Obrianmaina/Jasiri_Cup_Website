import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center md:items-start justify-between text-center md:text-left">
        <div className="mb-6 md:mb-0">
          <Image
            src="https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/whitelogo_bpym4s.png"
            alt="JasiriCup Logo"
            width={120}
            height={40}
            className="mb-2 mx-auto md:mx-0"
          />
          <p className="text-sm text-white">All rights reserved © 2025</p>
        </div>

        <div className="mb-6 md:mb-0">
          <p className="text-gray-300 mb-3">Connect with JasiriCup on:</p>
          <div className="flex justify-center md:justify-start space-x-4">
            <a
              href="https://www.facebook.com/JasiriCup" // Example Facebook link
              className="text-white hover:text-blue-600 transition-colors" // Hover color for Facebook
              target="_blank" // Opens in a new tab
              rel="noopener noreferrer" // Security best practice
            >
              <FaFacebookF size={20} />
            </a>
            <a
              href="https://www.instagram.com/JasiriCup" // Example Instagram link
              className="text-white hover:text-pink-600 transition-colors" // Hover color for Instagram
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram size={20} />
            </a>
            <a
              href="https://www.linkedin.com/company/JasiriCup" // Example LinkedIn link
              className="text-white hover:text-blue-700 transition-colors" // Hover color for LinkedIn
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedinIn size={20} />
            </a>
            <a
              href="https://www.youtube.com/JasiriCup" // Example YouTube link
              className="text-white hover:text-red-600 transition-colors" // Hover color for YouTube
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaYoutube size={20} />
            </a>
          </div>
        </div>

        <div className="max-w-xs text-gray-300 text-sm">
            <p>
            JasiriCup is committed to providing menstrual products, health resources, and opportunities for youth development. Join us in making a positive impact!
            </p>
        </div>
      </div>
    </footer>
  );
};

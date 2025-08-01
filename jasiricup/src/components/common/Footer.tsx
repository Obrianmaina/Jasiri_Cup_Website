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
          <p className="text-sm text-gray-400">All rights reserved © 2025</p>
        </div>

        <div className="mb-6 md:mb-0">
          <p className="text-gray-300 mb-3">Connect with JasiriCup on:</p>
          <div className="flex justify-center md:justify-start space-x-4">
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
        </div>

        <div className="max-w-xs text-gray-400 text-sm">
          <p>
            Menstrual products and adequate education. This initiative targets girls in rural areas (ASAL Regions that remain inadequately served) products and adequate.
          </p>
        </div>
      </div>
    </footer>
  );
};

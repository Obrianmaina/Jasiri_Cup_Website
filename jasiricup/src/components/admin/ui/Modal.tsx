import React from 'react';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: '400' });

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  return (
    <div className={`fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center p-4 z-50 ${montserrat.className}`} role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" role="document">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
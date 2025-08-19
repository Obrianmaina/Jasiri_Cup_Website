import React from 'react';
import { Montserrat } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: '400' });
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPrev: () => void;
  onNext: () => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, total, limit, onPrev, onNext }) => {
  return (
    <div className={`flex justify-center gap-4 mt-6 ${montserrat.className}`}>
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="px-4 py-2">
        Page {page} of {Math.ceil(total / limit)}
      </span>
      <button
        onClick={onNext}
        disabled={page * limit >= total}
        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
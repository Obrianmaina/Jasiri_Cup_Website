import Link from 'next/link';
import { FaHeart, FaCheckCircle } from 'react-icons/fa';

export default function ThankYouPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-full">
            <FaCheckCircle size={48} />
          </div>
        </div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-2">
          Thank You! <FaHeart className="text-purple-600" />
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
          Your donation was successful. You have just made a real difference in keeping a girl period-safe and in school. A receipt has been sent to your email.
        </p>
        <Link 
          href="/"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
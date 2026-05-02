import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  id: string;
}

export const TextArea = ({ label, id, className = '', ...props }: TextAreaProps) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-gray-700 dark:text-gray-200 text-lg font-medium mb-2 transition-colors">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={`appearance-none bg-gray-50 dark:bg-gray-800 rounded-lg w-full py-3 px-4 text-gray-700 dark:text-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none transition-colors ${className}`}
        {...props}
      />
    </div>
  );
};
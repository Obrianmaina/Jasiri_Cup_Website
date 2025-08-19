import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
}

export const Input = ({ label, id, className = '', ...props }: InputProps) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-gray-700 text-lg font-medium mb-2">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`appearance-none bg-gray-50 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className}`}
        {...props}
      />
    </div>
  );
};

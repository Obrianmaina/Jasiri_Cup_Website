'use client';
// src/components/blog/ShareButtons.tsx
import { useState } from 'react';
import { FaWhatsapp, FaFacebookF, FaTwitter, FaLink } from 'react-icons/fa';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export const ShareButtons = ({ title, url }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl   = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shares = [
    {
      label: 'WhatsApp',
      icon: FaWhatsapp,
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      bg: 'bg-green-500 hover:bg-green-600',
    },
    {
      label: 'Facebook',
      icon: FaFacebookF,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      label: 'Twitter / X',
      icon: FaTwitter,
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      bg: 'bg-sky-500 hover:bg-sky-600',
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {shares.map(s => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-2 ${s.bg} text-white px-4 py-2 rounded-full text-sm font-medium transition-colors`}
          aria-label={`Share on ${s.label}`}
        >
          <s.icon size={14} />
          {s.label}
        </a>
      ))}
      <button
        onClick={copyLink}
        className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full text-sm font-medium transition-colors"
      >
        <FaLink size={14} />
        {copied ? 'Copied!' : 'Copy Link'}
      </button>
    </div>
  );
};
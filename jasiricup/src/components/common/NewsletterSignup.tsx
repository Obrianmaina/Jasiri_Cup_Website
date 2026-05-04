'use client';
// src/components/common/NewsletterSignup.tsx
import { useState } from 'react';

interface NewsletterSignupProps {
  variant?: 'inline' | 'banner';
}

export const NewsletterSignup = ({ variant = 'inline' }: NewsletterSignupProps) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage('You\'re subscribed! Welcome to the JasiriCup community. 🌸');
        setEmail('');
        setName('');
      } else {
        throw new Error(data.error || 'Subscription failed');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  if (variant === 'banner') {
    return (
      <section className="bg-gradient-to-r from-purple-600 to-green-600 py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-purple-100 text-sm font-bold uppercase tracking-widest mb-2">
            Stay Connected
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Get Impact Updates
          </h2>
          <p className="text-purple-100 mb-8 max-w-md mx-auto">
            Monthly stories, impact numbers, and ways to help — straight to your inbox.
            No spam. Unsubscribe anytime.
          </p>

          {status === 'success' ? (
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 text-white font-semibold">
              ✅ {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 rounded-full text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-white text-purple-700 px-6 py-3 rounded-full font-bold text-sm hover:bg-purple-50 transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                {status === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="text-red-200 text-sm mt-3">{message}</p>
          )}
        </div>
      </section>
    );
  }

  // Inline variant (for sidebars, footers, etc.)
  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/50">
      <h3 className="font-bold text-gray-900 dark:text-white mb-1">
        📬 Stay in the loop
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Monthly impact updates. No spam.
      </p>

      {status === 'success' ? (
        <div className="text-sm text-green-700 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/30 rounded-xl p-3">
          ✅ {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-colors"
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-purple-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors disabled:opacity-60"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
          {status === 'error' && (
            <p className="text-red-600 dark:text-red-400 text-xs">{message}</p>
          )}
        </form>
      )}
    </div>
  );
};
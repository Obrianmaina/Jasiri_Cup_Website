'use client';
// src/components/donate/DonateClient.tsx
import { useState } from 'react';
import { FaMobileAlt, FaCreditCard, FaHeart } from 'react-icons/fa';

const TIERS = [
  {
    cups: 1,
    amount: 1500,
    label: '1 Cup',
    impact: 'Keeps 1 girl period-safe for up to 10 years',
    emoji: '🌸',
    highlight: false,
  },
  {
    cups: 5,
    amount: 7000,
    label: '5 Cups',
    impact: 'Supports a full classroom of girls for a decade',
    emoji: '🎓',
    highlight: true,
  },
  {
    cups: 10,
    amount: 13000,
    label: '10 Cups',
    impact: 'Equips an entire school year-group',
    emoji: '🏫',
    highlight: false,
  },
  {
    cups: 0,
    amount: 0,
    label: 'Custom',
    impact: 'Choose your own amount',
    emoji: '💜',
    highlight: false,
  },
];

type PayMethod = 'mpesa' | 'card';

export const DonateClient = () => {
  const [selectedTier, setSelectedTier] = useState(1);
  const [customAmount, setCustomAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PayMethod>('mpesa');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const tier = TIERS[selectedTier];
  const amount =
    tier.cups === 0
      ? parseInt(customAmount || '0', 10)
      : tier.amount;

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount < 100) {
      setStatus('error');
      setMessage('Minimum donation is KES 100.');
      return;
    }
    if (payMethod === 'mpesa' && !phone.match(/^(?:254|\+254|0)?[7][0-9]{8}$/)) {
      setStatus('error');
      setMessage('Please enter a valid Safaricom number.');
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, phone, name, email, payMethod, cups: tier.cups }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage(
          payMethod === 'mpesa'
            ? 'M-Pesa prompt sent to your phone. Please enter your PIN to complete.'
            : 'Redirecting to secure payment...',
        );
        if (payMethod === 'card' && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      } else {
        throw new Error(data.error || 'Payment failed');
      }
    } catch (err) {
      setStatus('error');
      setMessage(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12 mt-4">
        <span className="inline-block bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Change a Life Today
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
          Keep a Girl in School
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          One menstrual cup lasts up to 10 years. Your donation today gives a girl in
          rural Kenya her entire secondary education — period-free.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Tiers */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="font-bold text-gray-800 dark:text-white text-lg mb-4">
            Choose your impact
          </h2>
          {TIERS.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedTier(i)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                selectedTier === i
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-500 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 bg-white dark:bg-gray-900'
              } ${t.highlight ? 'ring-2 ring-green-400 ring-offset-1' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{t.emoji}</span>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {t.label}
                      {t.highlight && (
                        <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                          Most Popular
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {t.impact}
                    </div>
                  </div>
                </div>
                {t.amount > 0 && (
                  <div className="text-right">
                    <div className="font-black text-purple-700 dark:text-purple-400 text-lg">
                      KES {t.amount.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
              {/* Custom amount input */}
              {i === 3 && selectedTier === 3 && (
                <div className="mt-4">
                  <input
                    type="number"
                    min="100"
                    placeholder="Enter amount (KES)"
                    value={customAmount}
                    onChange={e => setCustomAmount(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none text-lg font-bold"
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Right: Payment form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 sticky top-24">
            <div className="text-center mb-6">
              <div className="text-3xl font-black text-purple-700 dark:text-purple-400">
                KES {amount > 0 ? amount.toLocaleString() : '—'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {tier.cups > 0 ? `${tier.cups} cup${tier.cups > 1 ? 's' : ''} donated` : 'Custom amount'}
              </div>
            </div>

            {/* Payment method toggle */}
            <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">
              {(
                [
                  { id: 'mpesa', icon: FaMobileAlt, label: 'M-Pesa' },
                  { id: 'card', icon: FaCreditCard, label: 'Card' },
                ] as const
              ).map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayMethod(m.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
                    payMethod === m.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <m.icon size={14} />
                  {m.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleDonate} className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
              <input
                type="email"
                placeholder="Email (for receipt)"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              />
              {payMethod === 'mpesa' && (
                <input
                  type="tel"
                  placeholder="M-Pesa number (07XX or 254...)"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              )}

              {status !== 'idle' && (
                <div
                  className={`text-sm p-3 rounded-xl ${
                    status === 'success'
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                  }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !amount}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                {loading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <FaHeart size={16} />
                )}
                {loading ? 'Processing...' : `Donate KES ${amount > 0 ? amount.toLocaleString() : '—'}`}
              </button>

              <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                🔒 Secure payment · Receipt via email · Tax deductible
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Impact breakdown */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {[
          { stat: '10 years', label: 'Cup lifespan', sub: 'One cup, a decade of dignity' },
          { stat: 'KES 0', label: 'Ongoing cost', sub: 'No pads to buy every month' },
          { stat: '100%', label: 'Goes to girls', sub: 'Zero admin overhead on donations' },
        ].map(item => (
          <div key={item.stat} className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/50">
            <div className="text-3xl font-black text-purple-700 dark:text-purple-400 mb-1">{item.stat}</div>
            <div className="font-bold text-gray-800 dark:text-gray-100 mb-1">{item.label}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
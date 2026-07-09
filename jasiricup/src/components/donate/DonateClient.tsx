'use client';

import { useState, useEffect } from 'react';
import { FaHeart } from 'react-icons/fa';

export interface Tier {
  cups: number;
  amount: number;
  label: string;
  impact: string;
  emoji: string;
  highlight: boolean;
}

export interface BottomStat {
  stat: string;
  label: string;
  sub: string;
}

export interface DonateData {
  heroTitle: string;
  heroSubtitle: string;
  tiers: Tier[];
  bottomStats: BottomStat[];
}

export interface SiteContentResponse {
  page: string;
  section: string;
  content: DonateData;
}

const DEFAULT_HERO_TITLE = 'Keep a Girl in School';
const DEFAULT_HERO_SUBTITLE = 'One menstrual cup lasts up to 10 years. Your donation today gives a girl in rural Kenya her entire secondary education, period-free.';

const DEFAULT_TIERS: Tier[] = [
  { cups: 1, amount: 1500, label: '1 Cup', impact: 'Keeps 1 girl period-safe for up to 10 years', emoji: '🌸', highlight: false },
  { cups: 5, amount: 7000, label: '5 Cups', impact: 'Supports a full classroom of girls for a decade', emoji: '🎓', highlight: true },
  { cups: 10, amount: 13000, label: '10 Cups', impact: 'Equips an entire school year-group', emoji: '🏫', highlight: false },
  { cups: 0, amount: 0, label: 'Custom', impact: 'Choose your own amount', emoji: '💜', highlight: false },
];

const DEFAULT_STATS: BottomStat[] = [
  { stat: '10 years', label: 'Cup lifespan', sub: 'One cup, a decade of dignity' },
  { stat: 'KES 0', label: 'Ongoing cost', sub: 'No pads to buy every month' },
  { stat: '100%', label: 'Goes to girls', sub: 'Zero admin overhead on donations' },
];

type Currency = 'KES' | 'USD' | 'EUR' | 'GBP';

const CURRENCIES: { id: Currency; symbol: string; label: string }[] = [
  { id: 'KES', symbol: 'KES', label: 'KES' },
  { id: 'USD', symbol: '$', label: 'USD' },
  { id: 'EUR', symbol: '€', label: 'EUR' },
  { id: 'GBP', symbol: '£', label: 'GBP' },
];

export const DonateClient = () => {
  const [cmsData, setCmsData] = useState<DonateData | null>(null);

  const [selectedTier, setSelectedTier] = useState(1);
  const [customAmount, setCustomAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('KES');
  const [rates, setRates] = useState<Record<string, number>>({ KES: 1, USD: 0.0075, EUR: 0.0069, GBP: 0.0059 });
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('/api/rates');
        const data = (await res.json()) as { rates?: Record<string, number> };
        if (data.rates) setRates(data.rates);
      } catch (error) {
        console.error('Failed to load rates', error);
      }
    };

    const fetchCmsContent = async () => {
      try {
        const res = await fetch('/api/site-content?page=donate');
        const json = (await res.json()) as { success: boolean; data?: SiteContentResponse[] };
        if (json.success && json.data && json.data.length > 0) {
          const donateDoc = json.data.find(d => d.page === 'donate');
          if (donateDoc && donateDoc.content) {
            setCmsData(donateDoc.content);
          }
        }
      } catch (error) {
        console.error('Failed to load CMS content', error);
      }
    };

    fetchRates();
    fetchCmsContent();
  }, []);

  const activeTiers = cmsData?.tiers || DEFAULT_TIERS;
  const activeStats = cmsData?.bottomStats || DEFAULT_STATS;
  const heroTitle = cmsData?.heroTitle || DEFAULT_HERO_TITLE;
  const heroSubtitle = cmsData?.heroSubtitle || DEFAULT_HERO_SUBTITLE;

  const targetRate = rates[currency] || 1;
  const activeCurrency = CURRENCIES.find(c => c.id === currency)!;
  
  const tier = activeTiers[selectedTier] || activeTiers[0];

  let displayAmount = 0;
  let baseAmountKes = 0;

  if (tier.cups === 0) {
    displayAmount = parseFloat(customAmount || '0');
    baseAmountKes = Math.round(displayAmount / targetRate);
  } else {
    baseAmountKes = tier.amount;
    displayAmount = currency === 'KES' 
      ? tier.amount 
      : parseFloat((tier.amount * targetRate).toFixed(2));
  }

  const formatCurrency = (val: number) => {
    if (currency === 'KES') return Math.round(val).toLocaleString();
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (baseAmountKes < 100) {
      setStatus('error');
      setMessage('Minimum donation is KES 100.');
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      const res = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: displayAmount, 
          baseAmountKes,
          currency,
          name, 
          email, 
          cups: tier.cups 
        }),
      });
      const data = (await res.json()) as { success?: boolean; checkoutUrl?: string; error?: string };

      if (res.ok && data.success) {
        setStatus('success');
        setMessage('Redirecting to secure payment...');
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      } else {
        throw new Error(data.error || 'Payment failed');
      }
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12 mt-4">
        
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
          {heroTitle}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          {heroSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Tiers */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-gray-800 dark:text-white text-lg">
              Choose your impact
            </h2>
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {CURRENCIES.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCurrency(c.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${
                    currency === c.id
                      ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {c.id}
                </button>
              ))}
            </div>
          </div>
          
          {activeTiers.map((t, i) => (
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
                      {activeCurrency.symbol} {formatCurrency(t.amount * targetRate)}
                    </div>
                  </div>
                )}
              </div>
              
              {t.cups === 0 && selectedTier === i && (
                <div className="mt-4">
                  <input
                    type="number"
                    min="1"
                    placeholder={`Enter amount (${activeCurrency.id})`}
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

        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 sticky top-24">
            <div className="text-center mb-6">
              <div className="text-3xl font-black text-purple-700 dark:text-purple-400">
                {displayAmount > 0 ? `${activeCurrency.symbol} ${formatCurrency(displayAmount)}` : '-'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {tier.cups > 0 ? `${tier.cups} cup${tier.cups > 1 ? 's' : ''} donated` : 'Custom amount'}
              </div>
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

              {currency !== 'KES' && baseAmountKes > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3 text-center">
                  <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                    International card payments are processed in KES. You will be billed KES {baseAmountKes.toLocaleString()}. Your bank handles the conversion automatically.
                  </p>
                </div>
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
                disabled={loading || displayAmount === 0 || isNaN(displayAmount)}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                {loading ? (
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <FaHeart size={16} />
                )}
                {loading ? 'Processing...' : `Donate ${displayAmount > 0 ? `${activeCurrency.symbol} ${formatCurrency(displayAmount)}` : '-'}`}
              </button>

              <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                🔒 Secure payment · Receipt via email · Tax deductible
              </p>
            </form>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {activeStats.map((item, idx) => (
          <div key={idx} className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/50">
            <div className="text-3xl font-black text-purple-700 dark:text-purple-400 mb-1">{item.stat}</div>
            <div className="font-bold text-gray-800 dark:text-gray-100 mb-1">{item.label}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
'use client';
// src/components/donate/DonateClient.tsx
import { useState, useEffect } from 'react';
import { FaMobileAlt, FaCreditCard, FaHeart } from 'react-icons/fa';

// 1. CMS Interfaces matching your DonateEditor
export interface Tier {
  cups: number;
  amount: number;
  label: string;
  impact: string;
  emoji: string;
  highlight: boolean;
}

export interface SiteContentResponse {
  page: string;
  section: string;
  content: DonateData;
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

// 2. Default Fallback Data (prevents blank screen while fetching)
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

type PayMethod = 'mpesa' | 'card';
type Currency = 'KES' | 'USD' | 'EUR' | 'GBP';

const CURRENCIES: { id: Currency; symbol: string; label: string }[] = [
  { id: 'KES', symbol: 'KES', label: 'KES' },
  { id: 'USD', symbol: '$', label: 'USD' },
  { id: 'EUR', symbol: '€', label: 'EUR' },
  { id: 'GBP', symbol: '£', label: 'GBP' },
];

export const DonateClient = () => {
  // CMS State
  const [cmsData, setCmsData] = useState<DonateData | null>(null);

  // Form & Payment State
  const [selectedTier, setSelectedTier] = useState(1);
  const [customAmount, setCustomAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PayMethod>('mpesa');
  const [currency, setCurrency] = useState<Currency>('KES');
  const [rates, setRates] = useState<Record<string, number>>({ KES: 1, USD: 0.0075, EUR: 0.0069, GBP: 0.0059 });
  
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // 3. Data Fetching Hook
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('/api/rates');
        const data = await res.json();
        if (data.rates) setRates(data.rates);
      } catch (error) {
        console.error('Failed to load rates', error);
      }
    };

    const fetchCmsContent = async () => {
      try {
        const res = await fetch('/api/site-content?page=donate');
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          // Find the donate document using the strictly typed interface
          const donateDoc = json.data.find((d: SiteContentResponse) => d.page === 'donate');
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

  // 4. Derive active content (uses CMS if loaded, otherwise uses defaults)
  const activeTiers = cmsData?.tiers || DEFAULT_TIERS;
  const activeStats = cmsData?.bottomStats || DEFAULT_STATS;
  const heroTitle = cmsData?.heroTitle || DEFAULT_HERO_TITLE;
  const heroSubtitle = cmsData?.heroSubtitle || DEFAULT_HERO_SUBTITLE;

  const targetRate = rates[currency] || 1;
  const activeCurrency = CURRENCIES.find(c => c.id === currency)!;
  
  // Safely grab the tier, defaulting to 0 if the admin deleted tiers and the selected index is out of bounds
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
    if (payMethod === 'mpesa' && !phone.match(/^(?:254|\+254|0)?[17][0-9]{8}$/)) {
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
        body: JSON.stringify({ 
          amount: displayAmount, 
          baseAmountKes,
          currency,
          phone, 
          name, 
          email, 
          payMethod, 
          cups: tier.cups 
        }),
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
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Dynamic Hero */}
      <div className="text-center mb-12 mt-4">
        <span className="inline-block bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Change a Life Today
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
          {heroTitle}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          {heroSubtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Dynamic Tiers */}
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
              
              {/* Dynamic check for Custom amount (cups === 0) */}
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

        {/* Right: Payment form */}
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
                <div>
                  <input
                    type="tel"
                    placeholder="M-Pesa number (07XX or 254...)"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              )}

              {/* Universal transparency notice */}
              {currency !== 'KES' && baseAmountKes > 0 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3 text-center">
                  <p className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                    {payMethod === 'mpesa' 
                      ? `M-Pesa payments are processed in KES. Your phone prompt will be for KES ${baseAmountKes.toLocaleString()}.` 
                      : `International card payments are processed in KES. You will be billed KES ${baseAmountKes.toLocaleString()}. Your bank handles the conversion automatically.`}
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

      {/* Dynamic Impact breakdown */}
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
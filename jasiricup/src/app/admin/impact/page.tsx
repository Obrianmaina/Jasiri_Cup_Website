'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

// Define the exact shape of our impact stats
interface ImpactStats {
  cupsDonated: number;
  girlsImpacted: number;
  schoolsReached: number;
  countiesReached: number;
  periodsManaged: number;
  volunteersActive: number;
  [key: string]: number; // Allows dynamic updates via the input handler
}

// Define the expected shape of the API response item
interface SiteContentItem {
  section: string;
  content?: Partial<ImpactStats>;
}

export default function AdminImpactEditor() {
  const [stats, setStats] = useState<ImpactStats>({
    cupsDonated: 5000,
    girlsImpacted: 12000,
    schoolsReached: 45,
    countiesReached: 8,
    periodsManaged: 60000,
    volunteersActive: 120,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/site-content?page=impact');
        if (res.ok) {
          const { data } = await res.json();
          // Replaced 'any' with our explicit 'SiteContentItem' type
          const statSection = data.find((d: SiteContentItem) => d.section === 'stats');
          if (statSection?.content) {
            setStats(prevStats => ({ ...prevStats, ...statSection.content }));
          }
        }
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const toastId = toast.loading('Saving impact stats...');
    try {
      const res = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: 'impact', section: 'stats', content: stats })
      });
      if (res.ok) toast.success('Stats updated successfully!', { id: toastId });
      else throw new Error('Save failed');
    } catch (err) {
      toast.error('Error saving stats', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStats({ ...stats, [e.target.name]: parseInt(e.target.value) || 0 });
  };

  return (
    <div className="pt-12 px-4 sm:px-6 space-y-6 sm:space-y-8 max-w-4xl mx-auto transition-colors duration-300">
      <div>
        <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 mb-4">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Global Impact Stats</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Override the auto-calculated statistics shown on the public Impact page.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {Object.entries(stats).map(([key, val]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="number"
                  name={key}
                  value={val}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 sm:py-2.5 text-base sm:text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none transition-colors"
                />
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-end">
            <Button onClick={handleSave} disabled={saving} variant="primary" className="w-full sm:w-auto px-8 py-3.5 sm:py-3 rounded-xl font-bold">
              {saving ? 'Saving...' : 'Save Overrides'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
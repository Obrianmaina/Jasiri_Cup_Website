'use client';
// src/components/admin/pages/DonateEditor.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

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

interface DonateEditorProps {
  initialData?: Partial<DonateData>;
  onSave: (payload: { page: string; data: DonateData }) => Promise<void>;
}

export const DonateEditor = ({ initialData, onSave }: DonateEditorProps) => {
  const [data, setData] = useState<DonateData>(() => {
    // Default fallback values if no database record exists yet
    return {
      heroTitle: initialData?.heroTitle || 'Keep a Girl in School',
      heroSubtitle: initialData?.heroSubtitle || 'One menstrual cup lasts up to 10 years. Your donation today gives a girl in rural Kenya her entire secondary education - period-free.',
      tiers: initialData?.tiers || [
        { cups: 1, amount: 1500, label: '1 Cup', impact: 'Keeps 1 girl period-safe for up to 10 years', emoji: '🌸', highlight: false },
        { cups: 5, amount: 7000, label: '5 Cups', impact: 'Supports a full classroom of girls for a decade', emoji: '🎓', highlight: true },
        { cups: 10, amount: 13000, label: '10 Cups', impact: 'Equips an entire school year-group', emoji: '🏫', highlight: false },
        { cups: 0, amount: 0, label: 'Custom', impact: 'Choose your own amount', emoji: '💜', highlight: false },
      ],
      bottomStats: initialData?.bottomStats || [
        { stat: '10 years', label: 'Cup lifespan', sub: 'One cup, a decade of dignity' },
        { stat: 'KES 0', label: 'Ongoing cost', sub: 'No pads to buy every month' },
        { stat: '100%', label: 'Goes to girls', sub: 'Zero admin overhead on donations' },
      ],
    };
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave({ page: 'donate', data });
    setSaving(false);
  };

  // Strictly typed update function using generics
  const updateTier = <K extends keyof Tier>(index: number, field: K, value: Tier[K]) => {
    const newTiers = [...data.tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setData({ ...data, tiers: newTiers });
  };

  // Strictly typed update function using generics
  const updateStat = <K extends keyof BottomStat>(index: number, field: K, value: BottomStat[K]) => {
    const newStats = [...data.bottomStats];
    newStats[index] = { ...newStats[index], [field]: value };
    setData({ ...data, bottomStats: newStats });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold mb-4 dark:text-white">Hero Content</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="heroTitle" className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
            <Input
              id="heroTitle"
              value={data.heroTitle}
              onChange={(e) => setData({ ...data, heroTitle: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="heroSubtitle" className="block text-sm font-medium mb-1 dark:text-gray-300">Subtitle</label>
            <textarea
              id="heroSubtitle"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 dark:bg-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              value={data.heroSubtitle}
              onChange={(e) => setData({ ...data, heroSubtitle: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Donation Tiers */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold dark:text-white">Donation Tiers</h3>
          <span className="text-xs text-gray-500">Note: Keep one tier with 0 cups/KES for the Custom option.</span>
        </div>
        <div className="space-y-4">
          {data.tiers.map((tier, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="col-span-2 sm:col-span-1">
                <Input
                  id={`tier-emoji-${idx}`}
                  value={tier.emoji}
                  onChange={(e) => updateTier(idx, 'emoji', e.target.value)}
                  placeholder="Emoji"
                />
              </div>
              <div className="col-span-10 sm:col-span-3">
                <Input
                  id={`tier-label-${idx}`}
                  value={tier.label}
                  onChange={(e) => updateTier(idx, 'label', e.target.value)}
                  placeholder="Label (e.g. 1 Cup)"
                />
              </div>
              <div className="col-span-6 sm:col-span-2">
                <Input
                  id={`tier-amount-${idx}`}
                  type="number"
                  value={tier.amount.toString()}
                  onChange={(e) => updateTier(idx, 'amount', parseInt(e.target.value) || 0)}
                  placeholder="KES Amount"
                />
              </div>
              <div className="col-span-6 sm:col-span-1">
                <Input
                  id={`tier-cups-${idx}`}
                  type="number"
                  value={tier.cups.toString()}
                  onChange={(e) => updateTier(idx, 'cups', parseInt(e.target.value) || 0)}
                  placeholder="Cups"
                />
              </div>
              <div className="col-span-12 sm:col-span-4">
                <Input
                  id={`tier-impact-${idx}`}
                  value={tier.impact}
                  onChange={(e) => updateTier(idx, 'impact', e.target.value)}
                  placeholder="Impact Description"
                />
              </div>
              <div className="col-span-12 sm:col-span-1 flex justify-center">
                <label htmlFor={`tier-highlight-${idx}`} className="flex flex-col items-center text-xs text-gray-500 cursor-pointer">
                  <input
                    id={`tier-highlight-${idx}`}
                    type="checkbox"
                    checked={tier.highlight}
                    onChange={(e) => updateTier(idx, 'highlight', e.target.checked)}
                    className="mb-1"
                  />
                  Highlight
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold mb-4 dark:text-white">Bottom Impact Tiles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.bottomStats.map((stat, idx) => (
            <div key={idx} className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <Input
                id={`stat-stat-${idx}`}
                value={stat.stat}
                onChange={(e) => updateStat(idx, 'stat', e.target.value)}
                placeholder="Main Stat (e.g. 10 years)"
              />
              <Input
                id={`stat-label-${idx}`}
                value={stat.label}
                onChange={(e) => updateStat(idx, 'label', e.target.value)}
                placeholder="Label (e.g. Cup lifespan)"
              />
              <Input
                id={`stat-sub-${idx}`}
                value={stat.sub}
                onChange={(e) => updateStat(idx, 'sub', e.target.value)}
                placeholder="Subtitle text"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};
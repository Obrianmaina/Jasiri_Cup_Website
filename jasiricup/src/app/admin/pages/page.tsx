// src/app/admin/pages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  imageSrc: string;
  cardColor: string;
}

interface ProductStep {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
}

interface ProductContent {
  title: string;
  description: string;
  heroImage: string;
  steps: ProductStep[];
  downloadCards: { title: string; description: string; downloadLink: string }[];
}

// ─── Default content ──────────────────────────────────────────────────────────

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Team Member Name',
    role: 'Founder',
    description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
    imageSrc: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1754083472/happy_girl_d1hc0b.png',
    cardColor: 'bg-purple-700',
  },
];

const DEFAULT_PRODUCT: ProductContent = {
  title: 'Menstrual Cup',
  description: 'This initiative targets girls in rural areas (ASAL Regions that remain inadequately served), who often lack access to affordable menstrual products and adequate education.',
  heroImage: 'https://res.cloudinary.com/dsvexizbx/image/upload/v1774461335/jasiricup/blog/arkg1r8epiy11wfu1zrw.png',
  steps: [
    { id: 1, title: 'Step 1: Preparation', description: 'Wash your hands thoroughly with soap and water. Sterilize the menstrual cup by boiling it in water for 5-10 minutes before first use.', videoUrl: '' },
    { id: 2, title: 'Step 2: Insertion', description: 'Fold the cup using your preferred folding technique. Insert the cup into your vagina at a 45-degree angle towards your tailbone.', videoUrl: '' },
    { id: 3, title: 'Step 3: Removal', description: 'Wash your hands, then gently pull the stem while bearing down with your pelvic muscles. Empty, rinse, and reinsert as needed.', videoUrl: '' },
  ],
  downloadCards: [
    { title: 'How to Use', description: 'Download our comprehensive guide for using the menstrual cup.', downloadLink: '' },
    { title: 'InfoSheet', description: 'Learn more about the JasiriCup initiative and its impact.', downloadLink: '' },
    { title: 'Hygiene Essentials', description: 'Tips and best practices for maintaining hygiene.', downloadLink: '' },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function TeamEditor({ data, onChange }: { data: TeamMember[]; onChange: (d: TeamMember[]) => void }) {
  const addMember = () => {
    onChange([...data, {
      id: Date.now().toString(),
      name: 'New Member',
      role: 'Team Member',
      description: 'Description goes here.',
      imageSrc: '',
      cardColor: 'bg-purple-700',
    }]);
  };

  const updateMember = (id: string, field: keyof TeamMember, value: string) => {
    onChange(data.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const removeMember = (id: string) => {
    onChange(data.filter(m => m.id !== id));
  };

  const COLOR_OPTIONS = [
    { value: 'bg-purple-700', label: 'Purple' },
    { value: 'bg-green-700', label: 'Green' },
    { value: 'bg-gray-800', label: 'Dark Gray' },
    { value: 'bg-blue-700', label: 'Blue' },
    { value: 'bg-rose-700', label: 'Rose' },
  ];

  return (
    <div className="space-y-4">
      {data.map((member, index) => (
        <div key={member.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-700 text-sm">Member {index + 1}</h4>
            <button
              onClick={() => removeMember(member.id)}
              className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              Remove
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                type="text"
                value={member.name}
                onChange={e => updateMember(member.id, 'name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <input
                type="text"
                value={member.role}
                onChange={e => updateMember(member.id, 'role', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                value={member.description}
                onChange={e => updateMember(member.id, 'description', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Image URL (Cloudinary)</label>
              <input
                type="text"
                value={member.imageSrc}
                onChange={e => updateMember(member.id, 'imageSrc', e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Card Color</label>
              <select
                value={member.cardColor}
                onChange={e => updateMember(member.id, 'cardColor', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {COLOR_OPTIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={addMember}
        className="w-full py-2.5 border-2 border-dashed border-purple-300 text-purple-600 rounded-xl text-sm font-medium hover:border-purple-500 hover:bg-purple-50 transition-colors"
      >
        + Add Team Member
      </button>
    </div>
  );
}

function ProductEditor({ data, onChange }: { data: ProductContent; onChange: (d: ProductContent) => void }) {
  const updateStep = (id: number, field: keyof ProductStep, value: string | number) => {
    onChange({
      ...data,
      steps: data.steps.map(s => s.id === id ? { ...s, [field]: value } : s),
    });
  };

  const updateCard = (index: number, field: string, value: string) => {
    const cards = [...data.downloadCards];
    cards[index] = { ...cards[index], [field]: value };
    onChange({ ...data, downloadCards: cards });
  };

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="font-semibold text-gray-700 text-sm mb-3">Product Hero Section</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Product Title</label>
            <input
              type="text"
              value={data.title}
              onChange={e => onChange({ ...data, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={data.description}
              onChange={e => onChange({ ...data, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Hero Image URL (Cloudinary)</label>
            <input
              type="text"
              value={data.heroImage}
              onChange={e => onChange({ ...data, heroImage: e.target.value })}
              placeholder="https://res.cloudinary.com/..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* How to Use Steps */}
      <div>
        <h4 className="font-semibold text-gray-700 text-sm mb-3">How to Use Steps</h4>
        <div className="space-y-3">
          {data.steps.map(step => (
            <div key={step.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-semibold text-purple-600 mb-2">Step {step.id}</p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={step.title}
                  onChange={e => updateStep(step.id, 'title', e.target.value)}
                  placeholder="Step title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <textarea
                  value={step.description}
                  onChange={e => updateStep(step.id, 'description', e.target.value)}
                  rows={2}
                  placeholder="Step description"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <input
                  type="text"
                  value={step.videoUrl}
                  onChange={e => updateStep(step.id, 'videoUrl', e.target.value)}
                  placeholder="Video URL (Cloudinary)"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Download Cards */}
      <div>
        <h4 className="font-semibold text-gray-700 text-sm mb-3">Download Cards</h4>
        <div className="space-y-3">
          {data.downloadCards.map((card, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-semibold text-purple-600 mb-2">Card {i + 1}</p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={card.title}
                  onChange={e => updateCard(i, 'title', e.target.value)}
                  placeholder="Card title"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={card.description}
                  onChange={e => updateCard(i, 'description', e.target.value)}
                  placeholder="Card description"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={card.downloadLink}
                  onChange={e => updateCard(i, 'downloadLink', e.target.value)}
                  placeholder="Download URL"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPagesPage() {
  const [activeTab, setActiveTab] = useState<'team' | 'product'>('team');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEFAULT_TEAM_MEMBERS);
  const [productContent, setProductContent] = useState<ProductContent>(DEFAULT_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [teamRes, productRes] = await Promise.all([
          fetch('/api/admin/site-content?page=team'),
          fetch('/api/admin/site-content?page=product'),
        ]);

        if (teamRes.ok) {
          const { data } = await teamRes.json();
          const teamSection = data.find((d: { section: string }) => d.section === 'members');
          if (teamSection?.content?.members) {
            setTeamMembers(teamSection.content.members);
          }
        }

        if (productRes.ok) {
          const { data } = await productRes.json();
          const heroSection = data.find((d: { section: string }) => d.section === 'main');
          if (heroSection?.content) {
            setProductContent(heroSection.content);
          }
        }
      } catch (err) {
        console.error('Failed to load content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const loadingToast = toast.loading('Saving changes...');

    try {
      const payload = activeTab === 'team'
        ? { page: 'team', section: 'members', content: { members: teamMembers } }
        : { page: 'product', section: 'main', content: productContent };

      const res = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Changes saved successfully!', { id: loadingToast });
      } else {
        throw new Error('Failed to save');
      }
    } catch {
      toast.error('Failed to save changes', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'team', label: '👥 Team Page' },
    { id: 'product', label: '📦 Product Page' },
  ] as const;

  return (
    <div className="space-y-8 w-6xl mx-auto px-4 sm:px-6 md:px-16 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Page Content</h1>
          <p className="mt-1 text-sm text-gray-500">Edit content for the Team and Product pages.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex items-center justify-center px-5 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50 w-full sm:w-auto"
        >
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-700 bg-purple-50'
                : 'border-transparent text-gray-600 hover:text-purple-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="ml-3 text-gray-500 text-sm">Loading content...</p>
          </div>
        ) : activeTab === 'team' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Team Members</h3>
              <a
                href="/team"
                target="_blank"
                className="text-xs text-purple-600 hover:underline"
              >
                Preview page →
              </a>
            </div>
            <TeamEditor data={teamMembers} onChange={setTeamMembers} />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Product Page Content</h3>
              <a
                href="/product"
                target="_blank"
                className="text-xs text-purple-600 hover:underline"
              >
                Preview page →
              </a>
            </div>
            <ProductEditor data={productContent} onChange={setProductContent} />
          </>
        )}
      </div>
    </div>
  );
}
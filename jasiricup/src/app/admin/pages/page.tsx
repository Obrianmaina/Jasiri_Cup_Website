// src/app/admin/pages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// --- Types ---
interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  imageSrc: string;
  cardColor: string;
  socials?: { platform: string; url: string }[];
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

interface HomeContent {
  about: { title: string; content: string; imageSrc: string };
  vision: { title: string; content: string };
  mission: { title: string; content: string };
  stats: {
    title: string;
    description: string;
    numbers: { label: string; value: string }[];
  };
}

// --- Defaults ---
const DEFAULT_HOME: HomeContent = {
  about: { title: '', content: '', imageSrc: '' },
  vision: { title: '', content: '' },
  mission: { title: '', content: '' },
  stats: { title: '', description: '', numbers: [] }
};
const DEFAULT_TEAM_MEMBERS: TeamMember[] = [];
const DEFAULT_PRODUCT: ProductContent = {
  title: '', description: '', heroImage: '', steps: [], downloadCards: []
};

// --- Sub-components ---
function HomeEditor({ data, onChange }: { data: HomeContent; onChange: (d: HomeContent) => void }) {
  // Helpers for the stats array
  const addStat = () => {
    const currentStats = data.stats || { title: '', description: '', numbers: [] };
    const numbers = currentStats.numbers || [];
    onChange({ ...data, stats: { ...currentStats, numbers: [...numbers, { label: 'New Stat', value: '0' }] } });
  };
  
  const updateStat = (index: number, field: 'label' | 'value', val: string) => {
    const newNumbers = [...data.stats.numbers];
    newNumbers[index] = { ...newNumbers[index], [field]: val };
    onChange({ ...data, stats: { ...data.stats, numbers: newNumbers } });
  };

  const removeStat = (index: number) => {
    const newNumbers = [...data.stats.numbers];
    newNumbers.splice(index, 1);
    onChange({ ...data, stats: { ...data.stats, numbers: newNumbers } });
  };

  // Ensure stats object exists to prevent crashes on legacy data
  const safeStats = data.stats || { title: '', description: '', numbers: [] };
  const safeNumbers = safeStats.numbers || [];

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-colors">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-3">About Section</h4>
        <div className="space-y-3">
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title</label><input type="text" value={data.about.title} onChange={e => onChange({ ...data, about: { ...data.about, title: e.target.value } })} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-purple-500 transition-colors" /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Content</label><textarea rows={4} value={data.about.content} onChange={e => onChange({ ...data, about: { ...data.about, content: e.target.value } })} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-purple-500 resize-none transition-colors" /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Image URL</label><input type="text" value={data.about.imageSrc} onChange={e => onChange({ ...data, about: { ...data.about, imageSrc: e.target.value } })} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-purple-500 transition-colors" /></div>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-colors">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-3">Vision Card</h4>
        <div className="space-y-3">
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title</label><input type="text" value={data.vision.title} onChange={e => onChange({ ...data, vision: { ...data.vision, title: e.target.value } })} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-purple-500 transition-colors" /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Content</label><textarea rows={3} value={data.vision.content} onChange={e => onChange({ ...data, vision: { ...data.vision, content: e.target.value } })} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-purple-500 resize-none transition-colors" /></div>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-colors">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-3">Mission Card</h4>
        <div className="space-y-3">
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title</label><input type="text" value={data.mission.title} onChange={e => onChange({ ...data, mission: { ...data.mission, title: e.target.value } })} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-purple-500 transition-colors" /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Content</label><textarea rows={3} value={data.mission.content} onChange={e => onChange({ ...data, mission: { ...data.mission, content: e.target.value } })} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-purple-500 resize-none transition-colors" /></div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-colors mt-8">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 text-lg border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">Impact Statistics Section</h4>
        
        <div className="space-y-4 mb-6">
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Call to Action Title</label><input type="text" placeholder="e.g. Help Us Reach More Girls" value={safeStats.title} onChange={e => onChange({ ...data, stats: { ...safeStats, title: e.target.value } })} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-purple-500 transition-colors" /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Call to Action Description</label><textarea rows={2} placeholder="e.g. Your contribution directly funds..." value={safeStats.description} onChange={e => onChange({ ...data, stats: { ...safeStats, description: e.target.value } })} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:ring-purple-500 resize-none transition-colors" /></div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Stat Numbers</h5>
            <button type="button" onClick={addStat} className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded transition-colors">+ Add Stat Tile</button>
          </div>
          
          {safeNumbers.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">No statistics added yet.</p>
          ) : (
            <div className="space-y-3">
              {safeNumbers.map((stat, i) => (
                <div key={i} className="flex gap-3 items-start bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
                  <div className="flex-1">
                    <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Number / Value</label>
                    <input type="text" placeholder="e.g. 5,000+" value={stat.value} onChange={e => updateStat(i, 'value', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded px-2 py-1.5 text-sm transition-colors" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Label</label>
                    <input type="text" placeholder="e.g. Cups Donated" value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded px-2 py-1.5 text-sm transition-colors" />
                  </div>
                  <div className="pt-5">
                    <button type="button" onClick={() => removeStat(i)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/30 px-3 py-1.5 rounded text-xs font-medium h-[34px] transition-colors">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TeamEditor({ data, onChange }: { data: TeamMember[]; onChange: (d: TeamMember[]) => void }) {
  const addMember = () => { onChange([...data, { id: Date.now().toString(), name: 'New Member', role: 'Team Member', description: '', imageSrc: '', cardColor: 'bg-purple-700', socials: [] }]); };
  const updateMember = <K extends keyof TeamMember>(id: string, field: K, value: TeamMember[K]) => { onChange(data.map(m => m.id === id ? { ...m, [field]: value } : m)); };
  const removeMember = (id: string) => { onChange(data.filter(m => m.id !== id)); };

  const addSocial = (memberId: string) => { onChange(data.map(m => m.id === memberId ? { ...m, socials: [...(m.socials || []), { platform: 'linkedin', url: '' }] } : m)); };
  const updateSocial = (memberId: string, socialIndex: number, field: 'platform' | 'url', value: string) => {
    onChange(data.map(m => {
      if (m.id !== memberId) return m;
      const newSocials = [...(m.socials || [])];
      newSocials[socialIndex] = { ...newSocials[socialIndex], [field]: value };
      return { ...m, socials: newSocials };
    }));
  };
  const removeSocial = (memberId: string, socialIndex: number) => {
    onChange(data.map(m => {
      if (m.id !== memberId) return m;
      const newSocials = [...(m.socials || [])];
      newSocials.splice(socialIndex, 1);
      return { ...m, socials: newSocials };
    }));
  };

  return (
    <div className="space-y-6">
      {data.map((member, index) => (
        <div key={member.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-gray-700 dark:text-gray-200 text-sm">Member {index + 1}</h4>
            <button onClick={() => removeMember(member.id)} className="text-red-500 hover:text-red-400 text-xs hover:bg-red-50 dark:hover:bg-red-900/30 px-2 py-1 rounded font-medium transition-colors">Remove Member</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name</label><input type="text" value={member.name} onChange={e => updateMember(member.id, 'name', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm transition-colors" /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Role</label><input type="text" value={member.role} onChange={e => updateMember(member.id, 'role', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm transition-colors" /></div>
            <div className="sm:col-span-2"><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label><textarea value={member.description} onChange={e => updateMember(member.id, 'description', e.target.value)} rows={3} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm resize-none transition-colors" /></div>
            <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Image URL</label><input type="text" value={member.imageSrc} onChange={e => updateMember(member.id, 'imageSrc', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm transition-colors" /></div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Card Color</label>
              <select value={member.cardColor} onChange={e => updateMember(member.id, 'cardColor', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm transition-colors">
                <option value="bg-purple-700">Purple</option>
                <option value="bg-green-700">Green</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">Social Links</label>
              <button type="button" onClick={() => addSocial(member.id)} className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded transition-colors">
                + Add Link
              </button>
            </div>
            {(!member.socials || member.socials.length === 0) ? (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">No social links added yet.</p>
            ) : (
              <div className="space-y-2">
                {member.socials.map((social, sIdx) => (
                  <div key={sIdx} className="flex gap-2">
                    <select
                      value={social.platform}
                      onChange={e => updateSocial(member.id, sIdx, 'platform', e.target.value)}
                      className="w-1/3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-2 py-1.5 text-sm transition-colors"
                    >
                      <option value="linkedin">LinkedIn</option>
                      <option value="x">X (Twitter)</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="website">Website</option>
                    </select>
                    <input
                      type="text"
                      value={social.url}
                      onChange={e => updateSocial(member.id, sIdx, 'url', e.target.value)}
                      placeholder="https://..."
                      className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-2 py-1.5 text-sm transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => removeSocial(member.id, sIdx)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg text-xs font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      <button onClick={addMember} className="w-full py-2.5 border-2 border-dashed border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">+ Add Team Member</button>
    </div>
  );
}

function ProductEditor({ data, onChange }: { data: ProductContent; onChange: (d: ProductContent) => void }) {
  const updateStep = (id: number, field: keyof ProductStep, value: string | number) => { onChange({ ...data, steps: data.steps.map(s => s.id === id ? { ...s, [field]: value } : s) }); };
  const updateCard = (index: number, field: string, value: string) => { const cards = [...data.downloadCards]; cards[index] = { ...cards[index], [field]: value }; onChange({ ...data, downloadCards: cards }); };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-colors">
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-3">Product Hero Section</h4>
        <div className="space-y-3">
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title</label><input type="text" value={data.title} onChange={e => onChange({ ...data, title: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm transition-colors" /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label><textarea value={data.description} onChange={e => onChange({ ...data, description: e.target.value })} rows={3} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm resize-none transition-colors" /></div>
          <div><label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Hero Image URL</label><input type="text" value={data.heroImage} onChange={e => onChange({ ...data, heroImage: e.target.value })} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm transition-colors" /></div>
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-3">How to Use Steps</h4>
        <div className="space-y-3">
          {data.steps.map(step => (
            <div key={step.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-2 transition-colors">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">Step {step.id}</p>
              <input type="text" value={step.title} onChange={e => updateStep(step.id, 'title', e.target.value)} placeholder="Title" className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm transition-colors" />
              <textarea value={step.description} onChange={e => updateStep(step.id, 'description', e.target.value)} rows={2} placeholder="Description" className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm resize-none transition-colors" />
              <input type="text" value={step.videoUrl} onChange={e => updateStep(step.id, 'videoUrl', e.target.value)} placeholder="Video URL" className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm transition-colors" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-200 text-sm mb-3">Download Cards</h4>
        <div className="space-y-3">
          {data.downloadCards.map((card, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 space-y-2 transition-colors">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">Card {i + 1}</p>
              <input type="text" value={card.title} onChange={e => updateCard(i, 'title', e.target.value)} placeholder="Title" className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm transition-colors" />
              <input type="text" value={card.description} onChange={e => updateCard(i, 'description', e.target.value)} placeholder="Description" className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm transition-colors" />
              <input type="text" value={card.downloadLink} onChange={e => updateCard(i, 'downloadLink', e.target.value)} placeholder="URL" className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function AdminPagesPage() {
  const [activeTab, setActiveTab] = useState<'home' | 'team' | 'product'>('home');
  const [homeContent, setHomeContent] = useState<HomeContent>(DEFAULT_HOME);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEFAULT_TEAM_MEMBERS);
  const [productContent, setProductContent] = useState<ProductContent>(DEFAULT_PRODUCT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [homeRes, teamRes, productRes] = await Promise.all([
          fetch('/api/admin/site-content?page=home'),
          fetch('/api/admin/site-content?page=team'),
          fetch('/api/admin/site-content?page=product'),
        ]);

        if (homeRes.ok) {
          const { data } = await homeRes.json();
          const mainSection = data.find((d: { section: string }) => d.section === 'main');
          if (mainSection?.content) setHomeContent(mainSection.content);
        }
        if (teamRes.ok) {
          const { data } = await teamRes.json();
          const teamSection = data.find((d: { section: string }) => d.section === 'members');
          if (teamSection?.content?.members) setTeamMembers(teamSection.content.members);
        }
        if (productRes.ok) {
          const { data } = await productRes.json();
          const heroSection = data.find((d: { section: string }) => d.section === 'main');
          if (heroSection?.content) setProductContent(heroSection.content);
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
      let payload;
      if (activeTab === 'home') payload = { page: 'home', section: 'main', content: homeContent };
      else if (activeTab === 'team') payload = { page: 'team', section: 'members', content: { members: teamMembers } };
      else payload = { page: 'product', section: 'main', content: productContent };

      const res = await fetch('/api/admin/site-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) toast.success('Changes saved successfully!', { id: loadingToast });
      else throw new Error('Failed to save');
    } catch {
      toast.error('Failed to save changes', { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'home', label: 'Home Page' },
    { id: 'team', label: 'Team Page' },
    { id: 'product', label: 'Product Page' },
  ] as const;

  return (
    <div className="space-y-8 w-6xl mx-auto px-4 sm:px-6 md:px-16 py-8 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-4 transition-colors">
        <div>
          <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 mb-4 transition-colors">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">Page Content</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors">Edit content for your website pages.</p>
        </div>
        <button onClick={handleSave} disabled={saving || loading} className="inline-flex items-center justify-center px-5 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition-colors shadow-sm disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 overflow-x-auto transition-colors">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap -mb-px border-b-2 ${
              activeTab === tab.id 
                ? 'border-purple-600 dark:border-purple-500 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30' 
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-5 md:p-6 transition-colors">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400"></div>
            <p className="ml-3 text-gray-500 dark:text-gray-400 text-sm">Loading content...</p>
          </div>
        ) : activeTab === 'home' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-100">Home Page Content</h3>
              <a href="/" target="_blank" className="text-xs text-purple-600 dark:text-purple-400 hover:underline">Preview page</a>
            </div>
            <HomeEditor data={homeContent} onChange={setHomeContent} />
          </>
        ) : activeTab === 'team' ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-100">Team Members</h3>
              <a href="/team" target="_blank" className="text-xs text-purple-600 dark:text-purple-400 hover:underline">Preview page</a>
            </div>
            <TeamEditor data={teamMembers} onChange={setTeamMembers} />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-100">Product Page Content</h3>
              <a href="/product" target="_blank" className="text-xs text-purple-600 dark:text-purple-400 hover:underline">Preview page</a>
            </div>
            <ProductEditor data={productContent} onChange={setProductContent} />
          </>
        )}
      </div>
    </div>
  );
}
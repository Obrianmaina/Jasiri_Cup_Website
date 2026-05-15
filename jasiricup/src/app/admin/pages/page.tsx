"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

// --- Types ---
interface TeamMember { id: string; name: string; role: string; description: string; imageSrc: string; cardColor: string; socials?: { platform: string; url: string }[]; }
interface ProductStep { id: number; title: string; description: string; videoUrl: string; }
interface ProductContent { 
  title: string; 
  description: string; 
  heroImage: string; 
  mainVideoUrl?: string; // Add this line
  steps: ProductStep[]; 
  downloadCards: { title: string; description: string; downloadLink: string }[]; 
}
interface SectionData<T> { section: string; content?: T; }
interface HomeContent { about: { title: string; content: string; imageSrc: string }; vision: { title: string; content: string }; mission: { title: string; content: string }; stats: { title: string; description: string; numbers: { label: string; value: string }[]; }; }
interface Story { id: number; name: string; age: number; county: string; school: string; image: string; headline: string; story: string; quote: string; impact: string[]; }
interface PressCoverage { outlet: string; headline: string; date: string; url: string; logo: string; }
interface PressDownload { name: string; desc: string; icon: string; file: string; }
interface Partner { name: string; county: string; girls: number; type: string; since: string; image?: string; }
interface VolunteerRole { icon: string; title: string; desc: string; commitment: string; location: string; image?: string; }
interface Testimonial { quote: string; name: string; location: string; role: string; avatar: string; }
interface MapCounty { name: string; region: string; girls: number; color: string; image?: string; imageAttribution?: string; }
interface ImpactPageContent { hero: { subtitle: string; title: string; description: string; }; testimonials: Testimonial[]; map: { title: string; subtitle: string; expansionNote: string; counties: MapCounty[]; }; }

// --- Defaults ---
const DEFAULT_HOME: HomeContent = { about: { title: "", content: "", imageSrc: "" }, vision: { title: "", content: "" }, mission: { title: "", content: "" }, stats: { title: "", description: "", numbers: [] } };
const DEFAULT_TEAM_MEMBERS: TeamMember[] = [];
const DEFAULT_PRODUCT: ProductContent = { title: "", description: "", heroImage: "", steps: [], downloadCards: [] };
const DEFAULT_STORIES: Story[] = [];
const DEFAULT_PRESS = { coverage: [] as PressCoverage[], downloads: [] as PressDownload[] };
const DEFAULT_PARTNERS: Partner[] = [];
const DEFAULT_VOLUNTEER: VolunteerRole[] = [];
const DEFAULT_IMPACT: ImpactPageContent = { hero: { subtitle: "", title: "", description: "" }, testimonials: [], map: { title: "", subtitle: "", expansionNote: "", counties: [] } };

// --- Sub-components ---
function HomeEditor({ data, onChange }: { data: HomeContent; onChange: (d: HomeContent) => void; }) {
  const addStat = () => {
    const currentStats = data.stats || { title: "", description: "", numbers: [], };
    const numbers = currentStats.numbers || [];
    onChange({ ...data, stats: { ...currentStats, numbers: [...numbers, { label: "New Stat", value: "0" }] } });
  };
  const updateStat = (index: number, field: "label" | "value", val: string) => {
    const newNumbers = [...data.stats.numbers];
    newNumbers[index] = { ...newNumbers[index], [field]: val };
    onChange({ ...data, stats: { ...data.stats, numbers: newNumbers } });
  };
  const removeStat = (index: number) => {
    const newNumbers = [...data.stats.numbers];
    newNumbers.splice(index, 1);
    onChange({ ...data, stats: { ...data.stats, numbers: newNumbers } });
  };
  const safeStats = data.stats || { title: "", description: "", numbers: [] };
  const safeNumbers = safeStats.numbers || [];
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-sm mb-3">About Section</h4>
        <div className="space-y-3">
          <div><label className="block text-xs mb-1">Title</label><input type="text" value={data.about.title} onChange={(e) => onChange({ ...data, about: { ...data.about, title: e.target.value } }) } className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          <div><label className="block text-xs mb-1">Content</label><textarea rows={4} value={data.about.content} onChange={(e) => onChange({ ...data, about: { ...data.about, content: e.target.value } }) } className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          <div><label className="block text-xs mb-1">Image URL</label><input type="text" value={data.about.imageSrc} onChange={(e) => onChange({ ...data, about: { ...data.about, imageSrc: e.target.value } }) } className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-sm mb-3">Vision & Mission</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1">Vision Title</label><input type="text" value={data.vision.title} onChange={(e) => onChange({ ...data, vision: { ...data.vision, title: e.target.value } }) } className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 mb-2" />
            <label className="block text-xs mb-1">Vision Content</label><textarea rows={3} value={data.vision.content} onChange={(e) => onChange({ ...data, vision: { ...data.vision, content: e.target.value } }) } className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" />
          </div>
          <div>
            <label className="block text-xs mb-1">Mission Title</label><input type="text" value={data.mission.title} onChange={(e) => onChange({ ...data, mission: { ...data.mission, title: e.target.value } }) } className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 mb-2" />
            <label className="block text-xs mb-1">Mission Content</label><textarea rows={3} value={data.mission.content} onChange={(e) => onChange({ ...data, mission: { ...data.mission, content: e.target.value } }) } className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" />
          </div>
        </div>
      </div>
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-lg border-b pb-2 mb-4">Impact Statistics Section</h4>
        <div className="space-y-4 mb-6">
          <div><label className="block text-xs mb-1">CTA Title</label><input type="text" value={safeStats.title} onChange={(e) => onChange({ ...data, stats: { ...safeStats, title: e.target.value } }) } className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          <div><label className="block text-xs mb-1">CTA Description</label><textarea rows={2} value={safeStats.description} onChange={(e) => onChange({ ...data, stats: { ...safeStats, description: e.target.value } }) } className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
        </div>
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-semibold text-sm">Stat Numbers</h5>
            <button type="button" onClick={addStat} className="text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded">+ Add Stat</button>
          </div>
          {safeNumbers.map((stat, i) => (
            <div key={i} className="flex gap-3 mb-2 items-start bg-white dark:bg-gray-900 p-3 rounded-lg border">
              <div className="flex-1"><label className="block text-[10px] uppercase mb-1">Value</label><input type="text" value={stat.value} onChange={(e) => updateStat(i, "value", e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm dark:bg-gray-800" /></div>
              <div className="flex-1"><label className="block text-[10px] uppercase mb-1">Label</label><input type="text" value={stat.label} onChange={(e) => updateStat(i, "label", e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm dark:bg-gray-800" /></div>
              <button type="button" onClick={() => removeStat(i)} className="text-red-500 bg-red-50 px-3 py-1.5 rounded text-xs mt-5">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeamEditor({ data, onChange }: { data: TeamMember[]; onChange: (d: TeamMember[]) => void; }) {
  const addMember = () => { onChange([ ...data, { id: Date.now().toString(), name: "New Member", role: "Role", description: "", imageSrc: "", cardColor: "bg-purple-700", socials: [] } ]); };
  const updateMember = <K extends keyof TeamMember>(id: string, field: K, value: TeamMember[K]) => { onChange(data.map((m) => (m.id === id ? { ...m, [field]: value } : m))); };
  const removeMember = (id: string) => { onChange(data.filter((m) => m.id !== id)); };
  return (
    <div className="space-y-6">
      {data.map((member, index) => (
        <div key={member.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-sm">Member {index + 1}</h4>
            <button onClick={() => removeMember(member.id)} className="text-red-500 text-xs px-2 py-1 rounded">Remove</button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className="block text-xs mb-1">Name</label><input type="text" value={member.name} onChange={(e) => updateMember(member.id, "name", e.target.value) } className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
            <div><label className="block text-xs mb-1">Role</label><input type="text" value={member.role} onChange={(e) => updateMember(member.id, "role", e.target.value) } className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
            <div className="col-span-2"><label className="block text-xs mb-1">Description</label><textarea value={member.description} onChange={(e) => updateMember(member.id, "description", e.target.value) } rows={2} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
            <div><label className="block text-xs mb-1">Image URL</label><input type="text" value={member.imageSrc} onChange={(e) => updateMember(member.id, "imageSrc", e.target.value) } className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
            <div>
              <label className="block text-xs mb-1">Card Color</label>
              <select value={member.cardColor} onChange={(e) => updateMember(member.id, "cardColor", e.target.value) } className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800">
                <option value="bg-purple-700">Purple</option>
                <option value="bg-green-700">Green</option>
              </select>
            </div>
          </div>
        </div>
      ))}
      <button onClick={addMember} className="w-full py-2.5 border-2 border-dashed border-purple-300 text-purple-600 rounded-xl text-sm font-medium">
        + Add Team Member
      </button>
    </div>
  );
}

function ProductEditor({ data, onChange }: { data: ProductContent; onChange: (d: ProductContent) => void; }) {
  const updateStep = (id: number, field: keyof ProductStep, value: string | number) => { onChange({ ...data, steps: data.steps.map((s) => s.id === id ? { ...s, [field]: value } : s ) }); };
  const updateCard = (index: number, field: string, value: string) => { const cards = [...data.downloadCards]; cards[index] = { ...cards[index], [field]: value }; onChange({ ...data, downloadCards: cards }); };
  
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-sm mb-3">Product Hero Section</h4>
        <div className="space-y-3">
          <div><label className="block text-xs mb-1">Title</label><input type="text" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          <div><label className="block text-xs mb-1">Description</label><textarea value={data.description} onChange={(e) => onChange({ ...data, description: e.target.value }) } rows={3} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          <div><label className="block text-xs mb-1">Hero Image URL</label><input type="text" value={data.heroImage} onChange={(e) => onChange({ ...data, heroImage: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          
          {/* NEW BLOCK ADDED HERE */}
          <div>
            <label className="block text-xs mb-1 text-purple-600 font-semibold">Main Tutorial Video URL (Optional)</label>
            <input type="text" value={data.mainVideoUrl || ""} onChange={(e) => onChange({ ...data, mainVideoUrl: e.target.value })} placeholder="YouTube, Vimeo, or MP4 link" className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 focus:ring-purple-500 focus:border-purple-500" />
          </div>
          {/* END NEW BLOCK */}

        </div>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-3">How to Use Steps</h4>
        <div className="space-y-3">
          {data.steps.map((step) => (
            <div key={step.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border space-y-2">
              <p className="text-xs font-semibold text-purple-600">Step {step.id}</p>
              <input type="text" value={step.title} onChange={(e) => updateStep(step.id, "title", e.target.value)} placeholder="Title" className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" />
              <textarea value={step.description} onChange={(e) => updateStep(step.id, "description", e.target.value) } rows={2} placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" />
              {/* I also removed the individual step video URL input here since we aren't using them anymore! */}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-sm mb-3">Download Cards</h4>
        <div className="space-y-3">
          {data.downloadCards.map((card, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border space-y-2">
              <p className="text-xs font-semibold text-purple-600">Card {i + 1}</p>
              <input type="text" value={card.title} onChange={(e) => updateCard(i, "title", e.target.value)} placeholder="Title" className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" />
              <input type="text" value={card.description} onChange={(e) => updateCard(i, "description", e.target.value)} placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" />
              <input type="text" value={card.downloadLink} onChange={(e) => updateCard(i, "downloadLink", e.target.value)} placeholder="URL" className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImpactPageEditor({ data, onChange }: { data: ImpactPageContent; onChange: (d: ImpactPageContent) => void; }) {
  return (
    <div className="space-y-6">
      
      {/* 1. Hero Section */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-sm mb-3">Hero Section</h4>
        <div className="space-y-3">
          <div><label className="block text-xs mb-1">Subtitle</label><input type="text" value={data.hero?.subtitle || ""} onChange={(e) => onChange({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          <div><label className="block text-xs mb-1">Title</label><input type="text" value={data.hero?.title || ""} onChange={(e) => onChange({ ...data, hero: { ...data.hero, title: e.target.value } })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          <div><label className="block text-xs mb-1">Description</label><textarea rows={3} value={data.hero?.description || ""} onChange={(e) => onChange({ ...data, hero: { ...data.hero, description: e.target.value } })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
        </div>
      </div>

      {/* 2. Testimonials (Quotes) Section */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Testimonials (Quotes)</h4>
        <GenericArrayEditor
          data={data.testimonials || []}
          onChange={(t) => onChange({ ...data, testimonials: t })}
          title="Testimonial"
          defaultItem={{ quote: "", name: "", location: "", role: "", avatar: "👤" }}
          fields={[
            { key: "avatar", label: "Emoji Avatar", type: "text" },
            { key: "name", label: "Name", type: "text" },
            { key: "location", label: "Location", type: "text" },
            { key: "role", label: "Role/Grade", type: "text" },
            { key: "quote", label: "Quote", type: "textarea" },
          ]}
        />
      </div>

      {/* 3. Impact Section Settings */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-sm mb-3">Impact Section Settings</h4>
        <div className="space-y-3">
          <div><label className="block text-xs mb-1">Title</label><input type="text" value={data.map?.title || ""} onChange={(e) => onChange({ ...data, map: { ...data.map, title: e.target.value } })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          <div><label className="block text-xs mb-1">Subtitle</label><textarea rows={2} value={data.map?.subtitle || ""} onChange={(e) => onChange({ ...data, map: { ...data.map, subtitle: e.target.value } })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          <div><label className="block text-xs mb-1">Expansion Note</label><textarea rows={2} value={data.map?.expansionNote || ""} onChange={(e) => onChange({ ...data, map: { ...data.map, expansionNote: e.target.value } })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
        </div>
      </div>

      {/* 4. Impact Cards */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Impact Cards</h4>
        <GenericArrayEditor
          data={data.map?.counties || []}
          onChange={(c) => onChange({ ...data, map: { ...data.map, counties: c } })}
          title="Location"
          defaultItem={{ name: "", region: "", girls: 0, color: "purple", image: "", imageAttribution: "" }}
          fields={[
            { key: "name", label: "Country/County Name", type: "text" },
            { key: "region", label: "Region", type: "text" },
            { key: "girls", label: "Girls Supported", type: "number" },
            { key: "image", label: "Background Image URL", type: "text" },
            { key: "imageAttribution", label: "Image Attribution (HTML Allowed)", type: "textarea" },
            { 
              key: "color", 
              label: "Theme Color", 
              type: "select",
              options: [
                { label: "Purple", value: "purple" },
                { label: "Green", value: "green" },
                { label: "Blue", value: "blue" },
                { label: "Amber", value: "amber" },
                { label: "Pink", value: "pink" },
                { label: "Red", value: "red" },
                { label: "Teal", value: "teal" },
              ]
            },
          ]}
        />
      </div>

    </div>
  );
}

// 1. Updated Interface to support select dropdowns
function GenericArrayEditor<T extends object>({ 
  data, 
  onChange, 
  defaultItem, 
  fields, 
  title 
}: { 
  data: T[]; 
  onChange: (d: T[]) => void; 
  defaultItem: T; 
  fields: { 
    key: keyof T; 
    label: string; 
    type: 'text' | 'textarea' | 'number' | 'array' | 'select'; 
    options?: { label: string; value: string }[]; 
  }[]; 
  title: string; 
}) {
  const updateItem = (index: number, key: keyof T, val: T[keyof T]) => { const copy = [...data]; copy[index] = { ...copy[index], [key]: val }; onChange(copy); };
  const addItem = () => onChange([...data, { ...defaultItem, id: Date.now() } as unknown as T]);
  const removeItem = (index: number) => onChange(data.filter((_, i) => i !== index));
  return (
    <div className="space-y-6">
      {data.map((item, i) => (
        <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 relative">
          <button onClick={() => removeItem(i)} className="absolute top-4 right-4 text-xs text-red-500">Remove</button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {fields.map(f => (
              <div key={String(f.key)} className={f.type === 'textarea' || f.type === 'array' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs mb-1">{f.label}</label>
                
                {/* 2. Added Select Rendering Logic */}
                {f.type === 'select' ? (
                  <select 
                    value={item[f.key] as unknown as string} 
                    onChange={e => updateItem(i, f.key, e.target.value as unknown as T[keyof T])} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select an option...</option>
                    {f.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea value={item[f.key] as unknown as string} onChange={e => updateItem(i, f.key, e.target.value as unknown as T[keyof T])} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" />
                ) : f.type === 'array' ? (
                  <input value={((item[f.key] as unknown as string[]) || []).join(', ')} onChange={e => updateItem(i, f.key, e.target.value.split(',').map(s => s.trim()) as unknown as T[keyof T])} placeholder="Comma separated" className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" />
                ) : (
                  <input type={f.type} value={item[f.key] as unknown as string} onChange={e => updateItem(i, f.key, (f.type === 'number' ? Number(e.target.value) : e.target.value) as unknown as T[keyof T])} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={addItem} className="w-full py-2.5 border-2 border-dashed border-purple-300 text-purple-600 rounded-xl text-sm font-medium">+ Add {title}</button>
    </div>
  );
}

// --- Main Page ---
type TabType = "home" | "team" | "product" | "stories" | "press" | "partners" | "volunteer" | "impact";

export default function AdminPagesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [homeContent, setHomeContent] = useState<HomeContent>(DEFAULT_HOME);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEFAULT_TEAM_MEMBERS);
  const [productContent, setProductContent] = useState<ProductContent>(DEFAULT_PRODUCT);
  const [stories, setStories] = useState<Story[]>(DEFAULT_STORIES);
  const [pressContent, setPressContent] = useState(DEFAULT_PRESS);
  const [partners, setPartners] = useState<Partner[]>(DEFAULT_PARTNERS);
  const [volunteerRoles, setVolunteerRoles] = useState<VolunteerRole[]>(DEFAULT_VOLUNTEER);
  const [impactContent, setImpactContent] = useState<ImpactPageContent>(DEFAULT_IMPACT);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [homeRes, teamRes, productRes, storiesRes, pressRes, partRes, volRes, impactRes] = await Promise.all([
          fetch('/api/admin/site-content?page=home'), fetch('/api/admin/site-content?page=team'), fetch('/api/admin/site-content?page=product'),
          fetch('/api/admin/site-content?page=stories'), fetch('/api/admin/site-content?page=press'), fetch('/api/admin/site-content?page=partners'), 
          fetch('/api/admin/site-content?page=volunteer'), fetch('/api/admin/site-content?page=impact')
        ]);
            
        if (homeRes.ok) { const { data } = await homeRes.json(); const m = data.find((d: SectionData<HomeContent>) => d.section === 'main'); if (m?.content) setHomeContent(m.content); }
        if (teamRes.ok) { const { data } = await teamRes.json(); const m = data.find((d: SectionData<{ members: TeamMember[] }>) => d.section === 'members'); if (m?.content?.members) setTeamMembers(m.content.members); }
        if (productRes.ok) { const { data } = await productRes.json(); const m = data.find((d: SectionData<ProductContent>) => d.section === 'main'); if (m?.content) setProductContent(m.content); }
        if (storiesRes.ok) { const { data } = await storiesRes.json(); const m = data.find((d: SectionData<{ stories: Story[] }>) => d.section === 'main'); if (m?.content?.stories) setStories(m.content.stories); }
        if (pressRes.ok) { const { data } = await pressRes.json(); const m = data.find((d: SectionData<{ coverage: PressCoverage[], downloads: PressDownload[] }>) => d.section === 'main'); if (m?.content) setPressContent(m.content); }
        if (partRes.ok) { const { data } = await partRes.json(); const m = data.find((d: SectionData<{ partners: Partner[] }>) => d.section === 'main'); if (m?.content?.partners) setPartners(m.content.partners); }
        if (volRes.ok) { const { data } = await volRes.json(); const m = data.find((d: SectionData<{ roles: VolunteerRole[] }>) => d.section === 'main'); if (m?.content?.roles) setVolunteerRoles(m.content.roles); }
        if (impactRes.ok) { const { data } = await impactRes.json(); const m = data.find((d: SectionData<ImpactPageContent>) => d.section === 'main'); if (m?.content) setImpactContent(m.content); }
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
    const loadingToast = toast.loading("Saving changes...");
    try {
      let payload;
      if (activeTab === "home") payload = { page: "home", section: "main", content: homeContent };
      else if (activeTab === "team") payload = { page: "team", section: "members", content: { members: teamMembers } };
      else if (activeTab === "product") payload = { page: "product", section: "main", content: productContent };
      else if (activeTab === "stories") payload = { page: "stories", section: "main", content: { stories } };
      else if (activeTab === "press") payload = { page: "press", section: "main", content: pressContent };
      else if (activeTab === "partners") payload = { page: "partners", section: "main", content: { partners } };
      else if (activeTab === "volunteer") payload = { page: "volunteer", section: "main", content: { roles: volunteerRoles } };
      else if (activeTab === "impact") payload = { page: "impact", section: "main", content: impactContent };

      const res = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) toast.success("Changes saved successfully!", { id: loadingToast });
      else throw new Error("Failed to save");
    } catch {
      toast.error("Failed to save changes", { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const TABS: {id: TabType, label: string}[] = [
    { id: "home", label: "Home" },
    { id: "team", label: "Team" },
    { id: "product", label: "Product" },
    { id: "stories", label: "Stories" },
    { id: "press", label: "Press" },
    { id: "partners", label: "Partners" },
    { id: "volunteer", label: "Volunteer" },
    { id: "impact", label: "Impact Page" },
  ];

  return (
    <div className="pt-12 space-y-8 w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b pb-4">
        <div>
          <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-purple-600 mb-4">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold dark:text-white">Page Content</h1>
          <p className="mt-1 text-sm text-gray-500">Edit content for your website pages.</p>
        </div>
        <button onClick={handleSave} disabled={saving || loading} className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium shadow-sm hover:bg-purple-700 disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      <div className="flex gap-2 border-b overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 text-sm font-medium rounded-t-lg whitespace-nowrap border-b-2 ${activeTab === tab.id ? "border-purple-600 text-purple-700 bg-purple-50" : "border-transparent text-gray-600"}`}>
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border p-5 md:p-6">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
        ) : activeTab === "home" ? (
          <HomeEditor data={homeContent} onChange={setHomeContent} />
        ) : activeTab === "team" ? (
          <TeamEditor data={teamMembers} onChange={setTeamMembers} />
        ) : activeTab === "product" ? (
          <ProductEditor data={productContent} onChange={setProductContent} />
        ) : activeTab === "impact" ? (
          <ImpactPageEditor data={impactContent} onChange={setImpactContent} />
        ) : activeTab === "stories" ? (
          <GenericArrayEditor
            data={stories} onChange={setStories} title="Story"
            defaultItem={{ id: 0, name: "", age: 15, county: "", school: "", image: "", headline: "", story: "", quote: "", impact: [] }}
            fields={[
              { key: "name", label: "Name", type: "text" }, { key: "age", label: "Age", type: "number" }, { key: "county", label: "County", type: "text" },
              { key: "school", label: "School", type: "text" }, { key: "image", label: "Image URL", type: "text" }, { key: "headline", label: "Headline", type: "text" },
              { key: "story", label: "Full Story", type: "textarea" }, { key: "quote", label: "Quote", type: "text" }, { key: "impact", label: "Impact Badges", type: "array" },
            ]}
          />
        ) : activeTab === "partners" ? (
          <GenericArrayEditor
            data={partners} onChange={setPartners} title="Partner"
            defaultItem={{ name: "", county: "", girls: 0, type: "School", since: "", image: "" }}
            fields={[
              { key: "name", label: "Partner Name", type: "text" }, { key: "county", label: "County/Region", type: "text" }, { key: "girls", label: "Girls Supported", type: "number" },
              { key: "type", label: "Type (School, NGO, etc)", type: "text" }, { key: "since", label: "Since Year", type: "text" },
              { key: "image", label: "Logo/Image URL", type: "text" },
            ]}
          />
        ) : activeTab === 'volunteer' ? (
          <GenericArrayEditor 
            data={volunteerRoles} onChange={setVolunteerRoles} title="Role" 
            defaultItem={{icon:' ', title:'', desc:'', commitment:'', location:'', image:''}} 
            fields={[
              {key:'icon', label:'Emoji Icon', type:'text'}, {key:'title', label:'Role Title', type:'text'}, {key:'desc', label:'Description', type:'textarea'}, 
              {key:'commitment', label:'Time Commitment', type:'text'}, {key:'location', label:'Location', type:'text'}, {key:'image', label:'Background Image URL', type:'text'}
            ]} 
          />
        ) : activeTab === "press" ? (
          <div className="space-y-8">
            <div>
              <h3 className="font-bold mb-4">Media Coverage</h3>
              <GenericArrayEditor
                data={pressContent.coverage} onChange={(c) => setPressContent({ ...pressContent, coverage: c }) } title="Article"
                defaultItem={{ outlet: "", headline: "", date: "", url: "", logo: "" }}
                fields={[
                  { key: "outlet", label: "Outlet Name", type: "text" }, { key: "headline", label: "Headline", type: "text" },
                  { key: "date", label: "Date", type: "text" }, { key: "url", label: "Link", type: "text" }, { key: "logo", label: "Logo URL", type: "text" },
                ]}
              />
            </div>
            <div>
              <h3 className="font-bold mb-4">Downloadable Assets</h3>
              <GenericArrayEditor
                data={pressContent.downloads} onChange={(d) => setPressContent({ ...pressContent, downloads: d }) } title="Asset"
                defaultItem={{ name: "", desc: "", icon: " ", file: "" }}
                fields={[
                  { key: "name", label: "Asset Name", type: "text" }, { key: "desc", label: "Description", type: "text" },
                  { key: "icon", label: "Emoji Icon", type: "text" }, { key: "file", label: "Download URL", type: "text" },
                ]}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
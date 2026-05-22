// src/app/admin/pages/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { SuccessModal } from '@/components/ui/Modal'; 
import { 
  Home, 
  Users, 
  Package, 
  BookOpen, 
  Newspaper, 
  Handshake, 
  Heart, 
  Globe, 
  Book,
  FileText
} from "lucide-react";

// --- Types ---
interface TeamMember { id: string; name: string; role: string; description: string; imageSrc: string; cardColor: string; socials?: { platform: string; url: string }[]; }
interface ProductStep { id: number; title: string; description: string; videoUrl: string; }
interface ProductContent { title: string; description: string; heroImage: string; mainVideoUrl?: string; steps: ProductStep[]; downloadCards: { title: string; description: string; downloadLink: string }[]; }
interface SectionData<T> { section: string; content?: T; }
interface HomeContent { about: { title: string; content: string; imageSrc: string }; vision: { title: string; content: string }; mission: { title: string; content: string }; stats: { title: string; description: string; numbers: { label: string; value: string }[]; }; }
interface Story { id: number; name: string; age: number; county: string; school: string; image: string; headline: string; story: string; quote: string; impact: string[]; }
interface PressCoverage { outlet: string; headline: string; date: string; url: string; logo: string; }
interface Partner { name: string; county: string; girls: number; type: string; since: string; image?: string; }
interface VolunteerRole { icon: string; title: string; desc: string; commitment: string; location: string; image?: string; }
interface Testimonial { quote: string; name: string; location: string; role: string; avatar: string; }
interface MapCounty { name: string; region: string; girls: number; color: string; image?: string; imageAttribution?: string; }
interface ImpactPageContent { hero: { subtitle: string; title: string; description: string; }; testimonials: Testimonial[]; map: { title: string; subtitle: string; expansionNote: string; counties: MapCounty[]; }; }

// Brand OS Interfaces
interface BrandTrait { name: string; description: string; }
interface ToneDef { name: string; hex: string; }
interface ColorDef { name: string; hex: string; tones?: ToneDef[]; }
interface GradientDef { name: string; from: string; via: string; to: string; }
interface LogoDef { name: string; url: string; type: string; }
interface PhotoDef { url: string; caption: string; }
interface EmojiDef { icon: string; usage: string; }
interface AssetDownload { name: string; desc: string; icon: string; file: string; }

interface BrandOSContent {
  title: string;
  intro: string;
  originStory: { title: string; content: string; };
  voice: { description: string; traits: BrandTrait[]; };
  typography: { primaryFont: string; description: string; };
  emojiSystem?: { description: string; howToUse: string; items: EmojiDef[]; };
  logos: { placementRules: string; items: LogoDef[]; };
  colors: { description: string; primary: ColorDef[]; gradients: GradientDef[]; };
  photography: { direction: string; targetDemographic: string; images: PhotoDef[]; };
  logoUsage?: { images: PhotoDef[] };
  smiley?: { core: PhotoDef[]; inAction: PhotoDef[] };
  downloads?: AssetDownload[];
}

// Usage Guide Interfaces
// Usage Guide Interfaces
interface UsageGuideSection {
  title: string;
  content: string;
  bullets: string[]; 
  additionalContent?: string; // NEW: Optional extra paragraph
  image?: string;
} 
interface UsageGuideContent {
  title: string;
  description: string;
  sections: UsageGuideSection[];
}

// --- Defaults ---
const DEFAULT_HOME: HomeContent = { about: { title: "", content: "", imageSrc: "" }, vision: { title: "", content: "" }, mission: { title: "", content: "" }, stats: { title: "", description: "", numbers: [] } };
const DEFAULT_TEAM_MEMBERS: TeamMember[] = [];
const DEFAULT_PRODUCT: ProductContent = { title: "", description: "", heroImage: "", steps: [], downloadCards: [] };
const DEFAULT_STORIES: Story[] = [];
const DEFAULT_PRESS = { coverage: [] as PressCoverage[] };
const DEFAULT_PARTNERS: Partner[] = [];
const DEFAULT_VOLUNTEER: VolunteerRole[] = [];
const DEFAULT_IMPACT: ImpactPageContent = { hero: { subtitle: "", title: "", description: "" }, testimonials: [], map: { title: "", subtitle: "", expansionNote: "", counties: [] } };
const DEFAULT_BRAND_OS: BrandOSContent = {
  title: "JaSiriCup Brand OS",
  intro: "Joy, empowerment, and approachability. Welcome to the visual foundation of our bold initiative.",
  originStory: { title: "The Origin of Our Name", content: "" },
  voice: { description: "", traits: [] },
  typography: { primaryFont: "Montserrat", description: "" },
  emojiSystem: { description: "", howToUse: "", items: [] },
  logos: { placementRules: "", items: [] },
  colors: { description: "", primary: [], gradients: [] },
  photography: { direction: "", targetDemographic: "", images: [] },
  logoUsage: { images: [] },
  smiley: { core: [], inAction: [] },
  downloads: []
};
const DEFAULT_USAGE_GUIDE: UsageGuideContent = { 
  title: "", 
  description: "", 
  sections: [] 
};

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
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-sm mb-3">Product Hero Section</h4>
        <div className="space-y-3">
          <div><label className="block text-xs mb-1">Title</label><input type="text" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          <div><label className="block text-xs mb-1">Description</label><textarea value={data.description} onChange={(e) => onChange({ ...data, description: e.target.value }) } rows={3} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          <div><label className="block text-xs mb-1">Hero Image URL</label><input type="text" value={data.heroImage} onChange={(e) => onChange({ ...data, heroImage: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          
          <div>
            <label className="block text-xs mb-1 text-purple-600 font-semibold">Main Tutorial Video URL (Optional)</label>
            <input type="text" value={data.mainVideoUrl || ""} onChange={(e) => onChange({ ...data, mainVideoUrl: e.target.value })} placeholder="YouTube, Vimeo, or MP4 link" className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 focus:ring-purple-500 focus:border-purple-500" />
          </div>
        </div>
      </div>
      
      <div>
        <h4 className="font-semibold text-sm mb-3">How to Use Steps</h4>
        <GenericArrayEditor
          data={data.steps || []}
          onChange={(steps) => onChange({ ...data, steps })}
          title="Step"
          defaultItem={{ id: 0, title: "", description: "", videoUrl: "" }}
          fields={[
            { key: "title", label: "Title", type: "text" },
            { key: "description", label: "Description", type: "textarea" },
          ]}
        />
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-3">Download Cards</h4>
        <GenericArrayEditor
          data={data.downloadCards || []}
          onChange={(cards) => onChange({ ...data, downloadCards: cards })}
          title="Download Card"
          defaultItem={{ title: "", description: "", downloadLink: "" }}
          fields={[
            { key: "title", label: "Title", type: "text" },
            { key: "description", label: "Description", type: "textarea" },
            { key: "downloadLink", label: "Download URL", type: "text" },
          ]}
        />
      </div>
    </div>
  );
}

function ImpactPageEditor({ data, onChange }: { data: ImpactPageContent; onChange: (d: ImpactPageContent) => void; }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-sm mb-3">Hero Section</h4>
        <div className="space-y-3">
          <div><label className="block text-xs mb-1">Subtitle</label><input type="text" value={data.hero?.subtitle || ""} onChange={(e) => onChange({ ...data, hero: { ...data.hero, subtitle: e.target.value } })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          <div><label className="block text-xs mb-1">Title</label><input type="text" value={data.hero?.title || ""} onChange={(e) => onChange({ ...data, hero: { ...data.hero, title: e.target.value } })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          <div><label className="block text-xs mb-1">Description</label><textarea rows={3} value={data.hero?.description || ""} onChange={(e) => onChange({ ...data, hero: { ...data.hero, description: e.target.value } })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
        </div>
      </div>

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

      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-sm mb-3">Impact Section Settings</h4>
        <div className="space-y-3">
          <div><label className="block text-xs mb-1">Title</label><input type="text" value={data.map?.title || ""} onChange={(e) => onChange({ ...data, map: { ...data.map, title: e.target.value } })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          <div><label className="block text-xs mb-1">Subtitle</label><textarea rows={2} value={data.map?.subtitle || ""} onChange={(e) => onChange({ ...data, map: { ...data.map, subtitle: e.target.value } })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          <div><label className="block text-xs mb-1">Expansion Note</label><textarea rows={2} value={data.map?.expansionNote || ""} onChange={(e) => onChange({ ...data, map: { ...data.map, expansionNote: e.target.value } })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
        </div>
      </div>

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
                { label: "purple", value: "purple" },
                { label: "green", value: "green" },
                { label: "blue", value: "blue" },
                { label: "amber", value: "amber" },
                { label: "pink", value: "pink" },
                { label: "red", value: "red" },
                { label: "teal", value: "teal" },
              ]
            },
          ]}
        />
      </div>
    </div>
  );
}

function PrimaryColorsEditor({ data, onChange }: { data: ColorDef[]; onChange: (d: ColorDef[]) => void; }) {
  const updateColor = <K extends keyof ColorDef,>(index: number, key: K, val: ColorDef[K]) => {
    const copy = [...data];
    copy[index] = { ...copy[index], [key]: val };
    onChange(copy);
  };
  const addColor = () => onChange([...data, { name: "", hex: "#000000", tones: [] }]);
  const removeColor = (index: number) => onChange(data.filter((_, i) => i !== index));

  const addTone = (colorIdx: number) => {
    const copy = [...data];
    const tones = copy[colorIdx].tones || [];
    copy[colorIdx].tones = [...tones, { name: "", hex: "#000000" }];
    onChange(copy);
  };
  const removeTone = (colorIdx: number, toneIdx: number) => {
    const copy = [...data];
    copy[colorIdx].tones = (copy[colorIdx].tones || []).filter((_, i) => i !== toneIdx);
    onChange(copy);
  };
  const updateTone = (colorIdx: number, toneIdx: number, key: keyof ToneDef, val: string) => {
    const copy = [...data];
    if (!copy[colorIdx].tones) copy[colorIdx].tones = [];
    copy[colorIdx].tones![toneIdx] = { ...copy[colorIdx].tones![toneIdx], [key]: val };
    onChange(copy);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...data];
    [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
    onChange(copy);
  };
  const moveDown = (index: number) => {
    if (index === data.length - 1) return;
    const copy = [...data];
    [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
    onChange(copy);
  };

  return (
    <div className="space-y-6">
      {data.map((color, i) => (
        <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700 relative pt-12 sm:pt-5">
          
          <div className="absolute top-3 right-3 flex items-center gap-1 sm:gap-2">
            <button type="button" onClick={() => moveUp(i)} disabled={i === 0} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-30 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">↑</button>
            <button type="button" onClick={() => moveDown(i)} disabled={i === data.length - 1} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-30 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">↓</button>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
            <button type="button" onClick={() => removeColor(i)} className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50 px-2.5 py-1.5 rounded-md transition-colors">Remove</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Primary Color Name</label>
              <input type="text" value={color.name || ""} onChange={e => updateColor(i, 'name', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 focus:ring-purple-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Hex Code</label>
              <div className="flex gap-2">
                <input type="color" value={color.hex || "#000000"} onChange={e => updateColor(i, 'hex', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                <input type="text" value={color.hex || ""} onChange={e => updateColor(i, 'hex', e.target.value)} className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 focus:ring-purple-500 transition-colors" />
              </div>
            </div>
          </div>

          {/* Tones Section */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h6 className="font-bold text-sm text-gray-700 dark:text-gray-300">Acceptable Tones & Accents</h6>
              <button type="button" onClick={() => addTone(i)} className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 px-3 py-1.5 rounded-md transition-colors">+ Add Tone</button>
            </div>
            
            <div className="space-y-3">
              {(color.tones || []).map((tone, j) => (
                <div key={j} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded border border-gray-100 dark:border-gray-700">
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Tone Name</label>
                    <input type="text" value={tone.name || ""} onChange={e => updateTone(i, j, 'name', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm dark:bg-gray-800 focus:ring-purple-500" placeholder="e.g. Light Accent" />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Hex Code</label>
                    <div className="flex gap-2">
                       <input type="color" value={tone.hex || "#000000"} onChange={e => updateTone(i, j, 'hex', e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0" />
                       <input type="text" value={tone.hex || ""} onChange={e => updateTone(i, j, 'hex', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm dark:bg-gray-800 focus:ring-purple-500" placeholder="#FFFFFF" />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeTone(i, j)} className="mt-4 sm:mt-5 text-red-500 hover:text-red-700 font-bold p-2 text-sm">✕</button>
                </div>
              ))}
              {(!color.tones || color.tones.length === 0) && (
                <p className="text-xs text-gray-500 italic text-center py-2">No tones added yet.</p>
              )}
            </div>
          </div>

        </div>
      ))}
      <button type="button" onClick={addColor} className="w-full py-3 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded-xl text-sm font-bold transition-colors border border-purple-100 dark:border-purple-900/50">
        + Add Primary Color
      </button>
    </div>
  );
}

// Brand OS Editor (Formerly GuideEditor)
function BrandOSEditor({ data, onChange }: { data: BrandOSContent; onChange: (d: BrandOSContent) => void; }) {
  return (
    <div className="space-y-8">
      {/* 1. Hero & Introduction */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-lg mb-4 text-purple-700 dark:text-purple-400">1. Hero & Introduction</h4>
        <div className="space-y-4">
          <div><label className="block text-xs font-semibold mb-1">Page Title</label><input type="text" value={data.title || ""} onChange={(e) => onChange({...data, title: e.target.value})} className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900" /></div>
          <div><label className="block text-xs font-semibold mb-1">Introduction Text</label><textarea value={data.intro || ""} onChange={(e) => onChange({...data, intro: e.target.value})} className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900" rows={3} /></div>
        </div>
      </div>

      {/* 2. Brand Origin */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-lg mb-4 text-purple-700 dark:text-purple-400">2. Origin Story</h4>
        <div className="space-y-4">
          <div><label className="block text-xs font-semibold mb-1">Section Title</label><input type="text" value={data.originStory?.title || ""} onChange={(e) => onChange({...data, originStory: {...data.originStory, title: e.target.value}})} className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900" /></div>
          <div><label className="block text-xs font-semibold mb-1">Origin Story Content</label><textarea value={data.originStory?.content || ""} onChange={(e) => onChange({...data, originStory: {...data.originStory, content: e.target.value}})} className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900" rows={4} /></div>
        </div>
      </div>

      {/* 3. Color Strategy */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-lg mb-4 text-purple-700 dark:text-purple-400">3. Color Strategy</h4>
        <div className="mb-6">
          <label className="block text-xs font-semibold mb-1">Color Strategy Description</label>
          <textarea value={data.colors?.description || ""} onChange={(e) => onChange({...data, colors: {...data.colors, description: e.target.value}})} className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900" rows={3} />
        </div>
        
        <h5 className="font-bold mb-3">Primary Colors</h5>
        <PrimaryColorsEditor 
          data={data.colors?.primary || []}
          onChange={(primary) => onChange({...data, colors: {...data.colors, primary}})}
        />

        <h5 className="font-bold mt-8 mb-3">Gradients</h5>
        <GenericArrayEditor
          data={data.colors?.gradients || []}
          onChange={(gradients) => onChange({...data, colors: {...data.colors, gradients}})}
          title="Gradient"
          defaultItem={{ name: "", from: "#000000", via: "", to: "#FFFFFF" }}
          fields={[
            { key: "name", label: "Gradient Name", type: "text" },
            { key: "from", label: "From Color (Hex)", type: "text" },
            { key: "via", label: "Via Color (Hex, Optional)", type: "text" },
            { key: "to", label: "To Color (Hex)", type: "text" }
          ]}
        />
      </div>

      {/* 4. Typography & Voice */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-lg mb-4 text-purple-700 dark:text-purple-400">4. Typography & Voice</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-semibold mb-1">Primary Font Name</label>
            <input type="text" value={data.typography?.primaryFont || ""} onChange={(e) => onChange({...data, typography: {...data.typography, primaryFont: e.target.value}})} className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900 mb-4" />
            <label className="block text-xs font-semibold mb-1">Typography Description</label>
            <textarea value={data.typography?.description || ""} onChange={(e) => onChange({...data, typography: {...data.typography, description: e.target.value}})} className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900" rows={3} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Brand Voice Description</label>
            <textarea value={data.voice?.description || ""} onChange={(e) => onChange({...data, voice: {...data.voice, description: e.target.value}})} className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900" rows={7} />
          </div>
        </div>
        
        <h5 className="font-bold mb-3">Brand Expression Traits</h5>
        <GenericArrayEditor
          data={data.voice?.traits || []}
          onChange={(traits) => onChange({...data, voice: {...data.voice, traits}})}
          title="Trait"
          defaultItem={{ name: "", description: "" }}
          fields={[
            { key: "name", label: "Trait Name", type: "text" },
            { key: "description", label: "Description", type: "textarea" }
          ]}
        />
      </div>

      {/* 5. Emoji System */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-lg mb-4 text-purple-700 dark:text-purple-400">5. Emoji System</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-semibold mb-1">Why We Love Emojis</label>
            <textarea value={data.emojiSystem?.description || ""} onChange={(e) => onChange({...data, emojiSystem: {...(data.emojiSystem || {description: "", howToUse: "", items: []}), description: e.target.value}})} className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900" rows={4} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">How We Use Them</label>
            <textarea value={data.emojiSystem?.howToUse || ""} onChange={(e) => onChange({...data, emojiSystem: {...(data.emojiSystem || {description: "", howToUse: "", items: []}), howToUse: e.target.value}})} className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900" rows={4} />
          </div>
        </div>
        
        <h5 className="font-bold mb-3">Example Emojis</h5>
        <GenericArrayEditor
          data={data.emojiSystem?.items || []}
          onChange={(items) => onChange({...data, emojiSystem: {...(data.emojiSystem || {description: "", howToUse: "", items: []}), items}})}
          title="Emoji"
          defaultItem={{ icon: "😊", usage: "" }}
          fields={[
            { key: "icon", label: "Emoji Character", type: "text" },
            { key: "usage", label: "Meaning / Usage", type: "text" }
          ]}
        />
      </div>

      {/* 6. Logo System */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-lg mb-4 text-purple-700 dark:text-purple-400">6. Logo System</h4>
        <div className="mb-6">
          <label className="block text-xs font-semibold mb-1">Placement Rules & Video Usage</label>
          <textarea value={data.logos?.placementRules || ""} onChange={(e) => onChange({...data, logos: {...data.logos, placementRules: e.target.value}})} className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900" rows={3} />
        </div>
        <GenericArrayEditor
          data={data.logos?.items || []}
          onChange={(items) => onChange({...data, logos: {...data.logos, items}})}
          title="Logo Variation"
          defaultItem={{ name: "", url: "", type: "Primary" }}
          fields={[
            { key: "name", label: "Logo Variant Name", type: "text" },
            { key: "type", label: "Type", type: "select", options: [{ label: "Primary", value: "Primary" }, { label: "Secondary", value: "Secondary" }] },
            { key: "url", label: "Logo Image URL", type: "text" }
          ]}
        />
      </div>

      {/* 7. Photography */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-lg mb-4 text-purple-700 dark:text-purple-400">7. Photography Direction</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-xs font-semibold mb-1">Direction (Images in Action)</label>
            <textarea value={data.photography?.direction || ""} onChange={(e) => onChange({...data, photography: {...data.photography, direction: e.target.value}})} className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900" rows={4} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Target Demographic</label>
            <textarea value={data.photography?.targetDemographic || ""} onChange={(e) => onChange({...data, photography: {...data.photography, targetDemographic: e.target.value}})} className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900" rows={4} />
          </div>
        </div>
        <h5 className="font-bold mb-3">Brand Imagery</h5>
        <GenericArrayEditor
          data={data.photography?.images || []}
          onChange={(images) => onChange({...data, photography: {...data.photography, images}})}
          title="Image"
          defaultItem={{ url: "", caption: "" }}
          fields={[
            { key: "url", label: "Image URL", type: "text" },
            { key: "caption", label: "Image Caption (Optional)", type: "text" }
          ]}
        />
      </div>
      
      {/* 8. Logo In Action */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-lg mb-4 text-purple-700 dark:text-purple-400">8. Logo In Action</h4>
        <GenericArrayEditor
          data={data.logoUsage?.images || []}
          onChange={(images) => onChange({...data, logoUsage: {...data.logoUsage, images}})}
          title="Logo Action Image"
          defaultItem={{ url: "", caption: "" }}
          fields={[
            { key: "url", label: "Image URL", type: "text" },
            { key: "caption", label: "Image Caption (Optional)", type: "text" }
          ]}
        />
      </div>

      {/* 9. The Smiley System */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-lg mb-4 text-purple-700 dark:text-purple-400">9. The Smiley System</h4>
        
        <h5 className="font-bold mb-3">Our Smiley (Top Grid)</h5>
        <GenericArrayEditor
          data={data.smiley?.core || []}
          onChange={(core) => onChange({...data, smiley: { core, inAction: data.smiley?.inAction || [] }})}
          title="Core Smiley"
          defaultItem={{ url: "", caption: "" }}
          fields={[
            { key: "url", label: "Image URL", type: "text" },
            { key: "caption", label: "Image Caption (Optional)", type: "text" }
          ]}
        />

        <h5 className="font-bold mt-8 mb-3">Smiley In Action</h5>
        <GenericArrayEditor
          data={data.smiley?.inAction || []}
          onChange={(inAction) => onChange({...data, smiley: { core: data.smiley?.core || [], inAction }})}
          title="Action Image"
          defaultItem={{ url: "", caption: "" }}
          fields={[
            { key: "url", label: "Image URL", type: "text" },
            { key: "caption", label: "Image Caption (Optional)", type: "text" }
          ]}
        />
      </div>

      {/* 10. Downloadable Assets (Moved from Press) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-lg mb-4 text-purple-700 dark:text-purple-400">10. Downloadable Assets</h4>
        <p className="text-sm text-gray-500 mb-4">Add downloadable files like logos or templates for the bottom of the Brand OS page.</p>
        <GenericArrayEditor
          data={data.downloads || []}
          onChange={(downloads) => onChange({...data, downloads})}
          title="Asset"
          defaultItem={{ name: "", desc: "", icon: " ", file: "" }}
          fields={[
            { key: "name", label: "Asset Name (e.g., Logo Pack)", type: "text" },
            { key: "desc", label: "Description", type: "text" },
            { key: "icon", label: "Emoji Icon", type: "text" },
            { key: "file", label: "Download Endpoint/URL (e.g., logos)", type: "text" }
          ]}
        />
      </div>

    </div>
  );
}

// NEW: Usage Guide Editor (For the live /guide product page)
function UsageGuideEditor({ data, onChange }: { data: UsageGuideContent; onChange: (d: UsageGuideContent) => void; }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-sm mb-3">Hero Section</h4>
        <div className="space-y-3">
          <div><label className="block text-xs mb-1">Page Title</label><input type="text" value={data.title || ""} onChange={(e) => onChange({ ...data, title: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
          <div><label className="block text-xs mb-1">Description</label><textarea rows={3} value={data.description || ""} onChange={(e) => onChange({ ...data, description: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800" /></div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-sm mb-3">Guide Sections</h4>
        <p className="text-xs text-gray-500 mb-4">Add the content blocks for your guide. Bullet points, additional paragraphs, and images are all completely optional.</p>
        <GenericArrayEditor
          data={data.sections || []}
          onChange={(sections) => onChange({ ...data, sections })}
          title="Section"
          // Added additionalContent to the default blank item
          defaultItem={{ title: "", content: "", bullets: [], additionalContent: "", image: "" }}
          fields={[
            { key: "title", label: "Section Title", type: "text" },
            { key: "content", label: "Main Paragraph Content", type: "textarea" },
            { key: "bullets", label: "Bullet Points (Separate with commas, Optional)", type: "array" },
            // Added the new text area for the additional paragraph
            { key: "additionalContent", label: "Additional Paragraph (Optional)", type: "textarea" },
            { key: "image", label: "Image URL (Optional)", type: "text" },
          ]}
        />
      </div>
    </div>
  );
}
// Generic Array Editor
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
  
  const moveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...data];
    [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
    onChange(copy);
  };

  const moveDown = (index: number) => {
    if (index === data.length - 1) return;
    const copy = [...data];
    [copy[index + 1], copy[index]] = [copy[index], copy[index + 1]];
    onChange(copy);
  };

  return (
    <div className="space-y-6">
      {data.map((item, i) => (
        <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700 relative pt-10 sm:pt-4">
          
          <div className="absolute top-3 right-3 flex items-center gap-1 sm:gap-2">
            <button type="button" onClick={() => moveUp(i)} disabled={i === 0} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-30 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
              ↑
            </button>
            <button type="button" onClick={() => moveDown(i)} disabled={i === data.length - 1} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-30 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
              ↓
            </button>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1"></div>
            <button type="button" onClick={() => removeItem(i)} className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50 px-2.5 py-1.5 rounded-md transition-colors">
              Remove
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {fields.map(f => (
              <div key={String(f.key)} className={f.type === 'textarea' || f.type === 'array' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">{f.label}</label>
                
                {f.type === 'select' ? (
                  <select 
                    value={(item[f.key] as unknown as string) || ""} 
                    onChange={e => updateItem(i, f.key, e.target.value as unknown as T[keyof T])} 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-purple-500 transition-colors"
                  >
                    <option value="">Select...</option>
                    {f.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea value={(item[f.key] as unknown as string) || ""} onChange={e => updateItem(i, f.key, e.target.value as unknown as T[keyof T])} rows={3} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 focus:ring-purple-500 transition-colors" />
                ) : f.type === 'array' ? (
                  <input value={((item[f.key] as unknown as string[]) || []).join(', ')} onChange={e => updateItem(i, f.key, e.target.value.split(',').map(s => s.trim()).filter(s => s !== '') as unknown as T[keyof T])} placeholder="Separate items with commas" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 focus:ring-purple-500 transition-colors" />
                ) : (
                  <input type={f.type} value={(item[f.key] as unknown as string) || ""} onChange={e => updateItem(i, f.key, (f.type === 'number' ? Number(e.target.value) : e.target.value) as unknown as T[keyof T])} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-800 focus:ring-purple-500 transition-colors" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={addItem} className="w-full py-3 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400 rounded-xl text-sm font-bold transition-colors border border-purple-100 dark:border-purple-900/50">
        + Add {title}
      </button>
    </div>
  );
}

// --- Main Page ---
type TabType = "home" | "team" | "product" | "stories" | "press" | "partners" | "volunteer" | "impact" | "brand-os" | "usage-guide";

export default function AdminPagesPage() {
  const [activeTab, setActiveTab] = useState<TabType | null>(null); 
  const [homeContent, setHomeContent] = useState<HomeContent>(DEFAULT_HOME);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(DEFAULT_TEAM_MEMBERS);
  const [productContent, setProductContent] = useState<ProductContent>(DEFAULT_PRODUCT);
  const [stories, setStories] = useState<Story[]>(DEFAULT_STORIES);
  const [pressContent, setPressContent] = useState(DEFAULT_PRESS);
  const [partners, setPartners] = useState<Partner[]>(DEFAULT_PARTNERS);
  const [volunteerRoles, setVolunteerRoles] = useState<VolunteerRole[]>(DEFAULT_VOLUNTEER);
  const [impactContent, setImpactContent] = useState<ImpactPageContent>(DEFAULT_IMPACT);
  const [brandOSContent, setBrandOSContent] = useState<BrandOSContent>(DEFAULT_BRAND_OS);
  const [usageGuideContent, setUsageGuideContent] = useState<UsageGuideContent>(DEFAULT_USAGE_GUIDE);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

useEffect(() => {
    const fetchContent = async () => {
      try {
        const [homeRes, teamRes, productRes, storiesRes, pressRes, partRes, volRes, impactRes, brandOsRes, usageGuideRes] = await Promise.all([
          fetch('/api/admin/site-content?page=home'), fetch('/api/admin/site-content?page=team'), fetch('/api/admin/site-content?page=product'),
          fetch('/api/admin/site-content?page=stories'), fetch('/api/admin/site-content?page=press'), fetch('/api/admin/site-content?page=partners'), 
          fetch('/api/admin/site-content?page=volunteer'), fetch('/api/admin/site-content?page=impact'), 
          fetch('/api/admin/site-content?page=brand-os'), // Fetching from the proper brand-os key
          fetch('/api/admin/site-content?page=usage-guide')
        ]);
            
        if (homeRes.ok) { const { data } = await homeRes.json(); const m = data.find((d: SectionData<HomeContent>) => d.section === 'main'); if (m?.content) setHomeContent(m.content); }
        if (teamRes.ok) { const { data } = await teamRes.json(); const m = data.find((d: SectionData<{ members: TeamMember[] }>) => d.section === 'members'); if (m?.content?.members) setTeamMembers(m.content.members); }
        if (productRes.ok) { const { data } = await productRes.json(); const m = data.find((d: SectionData<ProductContent>) => d.section === 'main'); if (m?.content) setProductContent(m.content); }
        if (storiesRes.ok) { const { data } = await storiesRes.json(); const m = data.find((d: SectionData<{ stories: Story[] }>) => d.section === 'main'); if (m?.content?.stories) setStories(m.content.stories); }
        if (pressRes.ok) { const { data } = await pressRes.json(); const m = data.find((d: SectionData<{ coverage: PressCoverage[] }>) => d.section === 'main'); if (m?.content) setPressContent(m.content); }
        if (partRes.ok) { const { data } = await partRes.json(); const m = data.find((d: SectionData<{ partners: Partner[] }>) => d.section === 'main'); if (m?.content?.partners) setPartners(m.content.partners); }
        if (volRes.ok) { const { data } = await volRes.json(); const m = data.find((d: SectionData<{ roles: VolunteerRole[] }>) => d.section === 'main'); if (m?.content?.roles) setVolunteerRoles(m.content.roles); }
        if (impactRes.ok) { const { data } = await impactRes.json(); const m = data.find((d: SectionData<ImpactPageContent>) => d.section === 'main'); if (m?.content) setImpactContent(m.content); }
        
        // SMART MIGRATION: Try loading brand-os first. If empty, fall back to the old 'guide' data so you don't lose your work!
        let loadedBrandOS = false;
        if (brandOsRes.ok) { 
          const { data } = await brandOsRes.json(); 
          const m = data.find((d: SectionData<BrandOSContent>) => d.section === 'main'); 
          // Ensure it's not just an empty object before accepting it
          if (m?.content && Object.keys(m.content).length > 0 && m.content.title) {
            setBrandOSContent(m.content); 
            loadedBrandOS = true;
          }
        }
        if (!loadedBrandOS) {
          const oldGuideRes = await fetch('/api/admin/site-content?page=guide');
          if (oldGuideRes.ok) {
            const { data } = await oldGuideRes.json();
            const m = data.find((d: SectionData<BrandOSContent>) => d.section === 'main');
            if (m?.content) setBrandOSContent(m.content);
          }
        }
        
        if (usageGuideRes.ok) { const { data } = await usageGuideRes.json(); const m = data.find((d: SectionData<UsageGuideContent>) => d.section === 'main'); if (m?.content) setUsageGuideContent(m.content); }
      } catch (err) {
        console.error('Failed to load content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    if (!activeTab) return; 
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
      
      // FIX: Ensure Brand OS specifically saves back to 'brand-os' to sync with the public page
      else if (activeTab === "brand-os") payload = { page: "brand-os", section: "main", content: brandOSContent };
      else if (activeTab === "usage-guide") payload = { page: "usage-guide", section: "main", content: usageGuideContent };

      const res = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.dismiss(loadingToast);
        setSuccessModal({ isOpen: true, message: "Page content saved successfully!" });
      } else {
        throw new Error("Failed to save");
      }
    } catch {
      toast.error("Failed to save changes", { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const TABS: {id: TabType, label: string, icon: React.ReactNode}[] = [
    { id: "home", label: "Home", icon: <Home size={36} strokeWidth={1.5} /> },
    { id: "team", label: "Team", icon: <Users size={36} strokeWidth={1.5} /> },
    { id: "product", label: "Product", icon: <Package size={36} strokeWidth={1.5} /> },
    { id: "stories", label: "Stories", icon: <BookOpen size={36} strokeWidth={1.5} /> },
    { id: "press", label: "Press", icon: <Newspaper size={36} strokeWidth={1.5} /> },
    { id: "partners", label: "Partners", icon: <Handshake size={36} strokeWidth={1.5} /> },
    { id: "volunteer", label: "Volunteer", icon: <Heart size={36} strokeWidth={1.5} /> },
    { id: "impact", label: "Impact", icon: <Globe size={36} strokeWidth={1.5} /> },
    { id: "usage-guide", label: "Usage Guide", icon: <FileText size={36} strokeWidth={1.5} /> },
    { id: "brand-os", label: "Brand OS", icon: <Book size={36} strokeWidth={1.5} /> },
  ];

  const activeTabData = TABS.find(t => t.id === activeTab);

  return (
    <div className="pt-12 space-y-8 max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {activeTab === null ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b pb-4 border-gray-200 dark:border-gray-800">
            <div>
              <Link href="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-purple-600 mb-4 hover:underline">
                &larr; Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold dark:text-white">Page Content</h1>
              <p className="mt-1 text-sm text-gray-500">Select a page below to edit its content.</p>
            </div>
          </div>

         {loading ? (
            <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {TABS.map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id)} 
                  className="p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all flex flex-col items-center justify-center gap-3 active:scale-95 group"
                >
                  <span className="mb-1 text-gray-400 group-hover:text-purple-600 dark:text-gray-500 dark:group-hover:text-purple-400 transition-colors">
                    {tab.icon}
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b pb-4 border-gray-200 dark:border-gray-800">
            <div>
              <button onClick={() => setActiveTab(null)} className="inline-flex items-center text-sm font-medium text-purple-600 mb-4 hover:underline">
                &larr; Back to Pages Grid
              </button>
              <h1 className="text-3xl font-bold dark:text-white">Editing {activeTabData?.label}</h1>
              <p className="mt-1 text-sm text-gray-500">Make changes to the {activeTabData?.label} page.</p>
            </div>
            <button onClick={handleSave} disabled={saving || loading} className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium shadow-sm hover:bg-purple-700 disabled:opacity-50 transition-colors">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-5 md:p-6">
            {activeTab === "home" ? (
              <HomeEditor data={homeContent} onChange={setHomeContent} />
            ) : activeTab === "team" ? (
              <TeamEditor data={teamMembers} onChange={setTeamMembers} />
            ) : activeTab === "product" ? (
              <ProductEditor data={productContent} onChange={setProductContent} />
            ) : activeTab === "impact" ? (
              <ImpactPageEditor data={impactContent} onChange={setImpactContent} />
            ) : activeTab === "brand-os" ? (
              <BrandOSEditor data={brandOSContent} onChange={setBrandOSContent} />
            ) : activeTab === "usage-guide" ? (
              <UsageGuideEditor data={usageGuideContent} onChange={setUsageGuideContent} />
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
              </div>
            ) : null}
          </div>
        </>
      )}

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, message: '' })}
        title="Changes Saved"
        message={successModal.message}
      />
    </div>
  );
}
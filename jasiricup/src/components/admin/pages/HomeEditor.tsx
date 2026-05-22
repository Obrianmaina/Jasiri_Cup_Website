import React from "react";
import { HomeContent } from "@/types/admin-pages";

export default function HomeEditor({ data, onChange }: { data: HomeContent; onChange: (d: HomeContent) => void; }) {
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
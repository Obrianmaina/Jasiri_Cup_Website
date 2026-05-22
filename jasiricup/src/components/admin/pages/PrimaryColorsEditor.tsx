import React from "react";
import { ColorDef, ToneDef } from "@/types/admin-pages";

export default function PrimaryColorsEditor({ data, onChange }: { data: ColorDef[]; onChange: (d: ColorDef[]) => void; }) {
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
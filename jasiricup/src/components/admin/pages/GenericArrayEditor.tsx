import React from "react";

export default function GenericArrayEditor<T extends object>({ 
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
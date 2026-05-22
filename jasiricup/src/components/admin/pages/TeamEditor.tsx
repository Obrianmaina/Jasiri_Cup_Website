import React from "react";
import { TeamMember } from "@/types/admin-pages";

export default function TeamEditor({ data, onChange }: { data: TeamMember[]; onChange: (d: TeamMember[]) => void; }) {
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
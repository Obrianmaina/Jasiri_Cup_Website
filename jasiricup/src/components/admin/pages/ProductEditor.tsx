import React from "react";
import { ProductContent } from "@/types/admin-pages";
import GenericArrayEditor from "./GenericArrayEditor";

export default function ProductEditor({ data, onChange }: { data: ProductContent; onChange: (d: ProductContent) => void; }) {
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
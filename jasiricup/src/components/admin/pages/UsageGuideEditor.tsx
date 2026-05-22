import React from "react";
import { UsageGuideContent } from "@/types/admin-pages";
import GenericArrayEditor from "./GenericArrayEditor";

export default function UsageGuideEditor({ data, onChange }: { data: UsageGuideContent; onChange: (d: UsageGuideContent) => void; }) {
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
          defaultItem={{ title: "", content: "", bullets: [], additionalContent: "", image: "" }}
          fields={[
            { key: "title", label: "Section Title", type: "text" },
            { key: "content", label: "Main Paragraph Content", type: "textarea" },
            { key: "bullets", label: "Bullet Points (Separate with commas, Optional)", type: "array" },
            { key: "additionalContent", label: "Additional Paragraph (Optional)", type: "textarea" },
            { key: "image", label: "Image URL (Optional)", type: "text" },
          ]}
        />
      </div>
    </div>
  );
}
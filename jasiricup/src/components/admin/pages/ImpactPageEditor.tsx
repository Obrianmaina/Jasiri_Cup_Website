import React from "react";
import { ImpactPageContent } from "@/types/admin-pages";
import GenericArrayEditor from "./GenericArrayEditor";

export default function ImpactPageEditor({ data, onChange }: { data: ImpactPageContent; onChange: (d: ImpactPageContent) => void; }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <h4 className="font-semibold text-sm mb-3">Hero Section</h4>
        <div className="space-y-3">
          
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
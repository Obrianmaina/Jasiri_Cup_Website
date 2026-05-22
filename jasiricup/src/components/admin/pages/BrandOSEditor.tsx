import React from "react";
import { BrandOSContent } from "@/types/admin-pages";
import GenericArrayEditor from "./GenericArrayEditor";
import PrimaryColorsEditor from "./PrimaryColorsEditor";

export default function BrandOSEditor({ data, onChange }: { data: BrandOSContent; onChange: (d: BrandOSContent) => void; }) {
  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-lg mb-4 text-purple-700 dark:text-purple-400">1. Hero & Introduction</h4>
        <div className="space-y-4">
          <div><label className="block text-xs font-semibold mb-1">Page Title</label><input type="text" value={data.title || ""} onChange={(e) => onChange({...data, title: e.target.value})} className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900" /></div>
          <div><label className="block text-xs font-semibold mb-1">Introduction Text</label><textarea value={data.intro || ""} onChange={(e) => onChange({...data, intro: e.target.value})} className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900" rows={3} /></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h4 className="font-bold text-lg mb-4 text-purple-700 dark:text-purple-400">2. Origin Story</h4>
        <div className="space-y-4">
          <div><label className="block text-xs font-semibold mb-1">Section Title</label><input type="text" value={data.originStory?.title || ""} onChange={(e) => onChange({...data, originStory: {...data.originStory, title: e.target.value}})} className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900" /></div>
          <div><label className="block text-xs font-semibold mb-1">Origin Story Content</label><textarea value={data.originStory?.content || ""} onChange={(e) => onChange({...data, originStory: {...data.originStory, content: e.target.value}})} className="w-full p-2 border rounded-lg text-sm dark:bg-gray-900" rows={4} /></div>
        </div>
      </div>

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
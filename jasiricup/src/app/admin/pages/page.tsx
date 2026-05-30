"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { SuccessModal } from '@/components/ui/Modal'; 
import { DonateEditor } from '@/components/admin/pages/DonateEditor';
import { 
  Home, Users, Package, BookOpen, Newspaper, Handshake, Heart, Globe, Book, FileText, HandHeart 
} from "lucide-react";

import { 
  TabType, HomeContent, TeamMember, ProductContent, Story, PressCoverage, Partner, 
  VolunteerRole, ImpactPageContent, BrandOSContent, UsageGuideContent, SectionData,
  DonateData, 
  DEFAULT_HOME, DEFAULT_TEAM_MEMBERS, DEFAULT_PRODUCT, DEFAULT_STORIES, DEFAULT_PRESS, 
  DEFAULT_PARTNERS, DEFAULT_VOLUNTEER, DEFAULT_IMPACT, DEFAULT_BRAND_OS, DEFAULT_USAGE_GUIDE
} from "@/types/admin-pages";

import GenericArrayEditor from "@/components/admin/pages/GenericArrayEditor";
import HomeEditor from "@/components/admin/pages/HomeEditor";
import TeamEditor from "@/components/admin/pages/TeamEditor";
import ProductEditor from "@/components/admin/pages/ProductEditor";
import ImpactPageEditor from "@/components/admin/pages/ImpactPageEditor";
import BrandOSEditor from "@/components/admin/pages/BrandOSEditor";
import UsageGuideEditor from "@/components/admin/pages/UsageGuideEditor";

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
  
  // Strictly typed state
  const [donateContent, setDonateContent] = useState<DonateData | null>(null);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [
          homeRes, teamRes, productRes, storiesRes, pressRes, partRes, volRes, impactRes, brandOsRes, usageGuideRes, donateRes
        ] = await Promise.all([
          fetch('/api/admin/site-content?page=home'), 
          fetch('/api/admin/site-content?page=team'), 
          fetch('/api/admin/site-content?page=product'),
          fetch('/api/admin/site-content?page=stories'), 
          fetch('/api/admin/site-content?page=press'), 
          fetch('/api/admin/site-content?page=partners'), 
          fetch('/api/admin/site-content?page=volunteer'), 
          fetch('/api/admin/site-content?page=impact'), 
          fetch('/api/admin/site-content?page=brand-os'),
          fetch('/api/admin/site-content?page=usage-guide'),
          fetch('/api/admin/site-content?page=donate') 
        ]);
            
        if (homeRes.ok) { const { data } = await homeRes.json(); const m = data.find((d: SectionData<HomeContent>) => d.section === 'main'); if (m?.content) setHomeContent(m.content); }
        if (teamRes.ok) { const { data } = await teamRes.json(); const m = data.find((d: SectionData<{ members: TeamMember[] }>) => d.section === 'members'); if (m?.content?.members) setTeamMembers(m.content.members); }
        if (productRes.ok) { const { data } = await productRes.json(); const m = data.find((d: SectionData<ProductContent>) => d.section === 'main'); if (m?.content) setProductContent(m.content); }
        if (storiesRes.ok) { const { data } = await storiesRes.json(); const m = data.find((d: SectionData<{ stories: Story[] }>) => d.section === 'main'); if (m?.content?.stories) setStories(m.content.stories); }
        if (pressRes.ok) { const { data } = await pressRes.json(); const m = data.find((d: SectionData<{ coverage: PressCoverage[] }>) => d.section === 'main'); if (m?.content) setPressContent(m.content); }
        if (partRes.ok) { const { data } = await partRes.json(); const m = data.find((d: SectionData<{ partners: Partner[] }>) => d.section === 'main'); if (m?.content?.partners) setPartners(m.content.partners); }
        if (volRes.ok) { const { data } = await volRes.json(); const m = data.find((d: SectionData<{ roles: VolunteerRole[] }>) => d.section === 'main'); if (m?.content?.roles) setVolunteerRoles(m.content.roles); }
        if (impactRes.ok) { const { data } = await impactRes.json(); const m = data.find((d: SectionData<ImpactPageContent>) => d.section === 'main'); if (m?.content) setImpactContent(m.content); }
        
        let loadedBrandOS = false;
        if (brandOsRes.ok) { 
          const { data } = await brandOsRes.json(); 
          const m = data.find((d: SectionData<BrandOSContent>) => d.section === 'main'); 
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
        
        // Strictly typed find method
        if (donateRes.ok) { 
          const { data } = await donateRes.json(); 
          const m = data.find((d: SectionData<DonateData>) => d.section === 'main'); 
          if (m?.content) setDonateContent(m.content); 
        }

      } catch (err) {
        console.error('Failed to load content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    if (!activeTab || activeTab === "donate") return; 
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

  // Strictly typed payload parameter
  const handleDonateSave = async (payload: { page: string; data: DonateData }) => {
    setSaving(true);
    const loadingToast = toast.loading("Saving donate page...");
    try {
      const res = await fetch("/api/admin/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: payload.page,
          section: 'main',
          content: payload.data
        }),
      });
      
      if (res.ok) {
        toast.dismiss(loadingToast);
        setSuccessModal({ isOpen: true, message: "Donate page saved successfully!" });
        setDonateContent(payload.data); 
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save donate page", { id: loadingToast });
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
    // Use HandHeart for Volunteer
    { id: "volunteer", label: "Volunteer", icon: <HandHeart size={36} strokeWidth={1.5} /> },
    { id: "impact", label: "Impact", icon: <Globe size={36} strokeWidth={1.5} /> },
    { id: "usage-guide", label: "Usage Guide", icon: <FileText size={36} strokeWidth={1.5} /> },
    { id: "brand-os", label: "Brand OS", icon: <Book size={36} strokeWidth={1.5} /> },
    // Keep Heart for Donate
    { id: "donate", label: "Donate Page", icon: <Heart size={36} strokeWidth={1.5} /> },
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
            
            {activeTab !== "donate" && (
              <button onClick={handleSave} disabled={saving || loading} className="px-5 py-2.5 bg-purple-600 text-white rounded-xl font-medium shadow-sm hover:bg-purple-700 disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            )}
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
            ) : activeTab === "donate" ? (
              <DonateEditor 
                initialData={donateContent || undefined} 
                onSave={handleDonateSave} 
              />
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
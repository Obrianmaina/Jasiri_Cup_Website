export type TabType = "home" | "team" | "product" | "stories" | "press" | "partners" | "volunteer" | "impact" | "brand-os" | "usage-guide";

export interface TeamMember { id: string; name: string; role: string; description: string; imageSrc: string; cardColor: string; socials?: { platform: string; url: string }[]; }
export interface ProductStep { id: number; title: string; description: string; videoUrl: string; }
export interface ProductContent { title: string; description: string; heroImage: string; mainVideoUrl?: string; steps: ProductStep[]; downloadCards: { title: string; description: string; downloadLink: string }[]; }
export interface SectionData<T> { section: string; content?: T; }
export interface HomeContent { about: { title: string; content: string; imageSrc: string }; vision: { title: string; content: string }; mission: { title: string; content: string }; stats: { title: string; description: string; numbers: { label: string; value: string }[]; }; }
export interface Story { id: number; name: string; age: number; county: string; school: string; image: string; headline: string; story: string; quote: string; impact: string[]; }
export interface PressCoverage { outlet: string; headline: string; date: string; url: string; logo: string; }
export interface Partner { name: string; county: string; girls: number; type: string; since: string; image?: string; }
export interface VolunteerRole { icon: string; title: string; desc: string; commitment: string; location: string; image?: string; }
export interface Testimonial { quote: string; name: string; location: string; role: string; avatar: string; }
export interface MapCounty { name: string; region: string; girls: number; color: string; image?: string; imageAttribution?: string; }
export interface ImpactPageContent { hero: { subtitle: string; title: string; description: string; }; testimonials: Testimonial[]; map: { title: string; subtitle: string; expansionNote: string; counties: MapCounty[]; }; }

export interface BrandTrait { name: string; description: string; }
export interface ToneDef { name: string; hex: string; }
export interface ColorDef { name: string; hex: string; tones?: ToneDef[]; }
export interface GradientDef { name: string; from: string; via: string; to: string; }
export interface LogoDef { name: string; url: string; type: string; }
export interface PhotoDef { url: string; caption: string; }
export interface EmojiDef { icon: string; usage: string; }
export interface AssetDownload { name: string; desc: string; icon: string; file: string; }

export interface BrandOSContent {
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

export interface UsageGuideSection {
  title: string;
  content: string;
  bullets: string[]; 
  additionalContent?: string;
  image?: string;
} 
export interface UsageGuideContent {
  title: string;
  description: string;
  sections: UsageGuideSection[];
}

export const DEFAULT_HOME: HomeContent = { about: { title: "", content: "", imageSrc: "" }, vision: { title: "", content: "" }, mission: { title: "", content: "" }, stats: { title: "", description: "", numbers: [] } };
export const DEFAULT_TEAM_MEMBERS: TeamMember[] = [];
export const DEFAULT_PRODUCT: ProductContent = { title: "", description: "", heroImage: "", steps: [], downloadCards: [] };
export const DEFAULT_STORIES: Story[] = [];
export const DEFAULT_PRESS = { coverage: [] as PressCoverage[] };
export const DEFAULT_PARTNERS: Partner[] = [];
export const DEFAULT_VOLUNTEER: VolunteerRole[] = [];
export const DEFAULT_IMPACT: ImpactPageContent = { hero: { subtitle: "", title: "", description: "" }, testimonials: [], map: { title: "", subtitle: "", expansionNote: "", counties: [] } };
export const DEFAULT_BRAND_OS: BrandOSContent = {
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
export const DEFAULT_USAGE_GUIDE: UsageGuideContent = { 
  title: "", 
  description: "", 
  sections: [] 
};
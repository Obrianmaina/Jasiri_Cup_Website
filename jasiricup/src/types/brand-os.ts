export interface BrandTrait { name: string; description: string; }
export interface ToneDef { name: string; hex: string; }
export interface ColorDef { name: string; hex: string; tones?: ToneDef[]; }
export interface GradientDef { name: string; from: string; via: string; to: string; }
export interface LogoDef { name: string; url: string; type: string; }
export interface PhotoDef { url: string; caption: string; }
export interface EmojiDef { icon: string; usage: string; }
export interface AssetDownload { name: string; desc: string; icon: string; file: string; }

export interface GuideContent {
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
export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  author?: string;
  heroImage: string;
  content: string;
  publishedDate: string;
  tags?: string[];
  status: 'draft' | 'published';
}
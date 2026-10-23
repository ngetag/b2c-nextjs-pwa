export interface BlogSection {
  heading: string;
  paragraphs: string[];
}

export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  region: string;
  spotIds: string[];
  sections: BlogSection[];
  featured?: boolean;
}

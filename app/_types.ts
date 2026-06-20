// app/_types.ts

// 🏷️ Category Filter Layout Types
export type Category = 'politics' | 'sports' | 'technology' | 'entertainment' | 'business' | 'health';

// 🌍 Multi-language Tracking Targets
export type Language = 'en' | 'hi' | 'bn';

// 📰 Core News Article Data Architecture Models
export interface Article {
  id: string;
  title: string;
  description: string | null;
  urlToImage: string | null;
  url: string;
  source: { 
    name: string 
  };
  publishedAt: string;
  content: string | null;
  category: Category;
  language: Language;
  likes: number;
}

export default function TypesRouteBypass() {
  return null;
}
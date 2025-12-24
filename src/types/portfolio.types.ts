import { LocalizedContent } from './content.types';

export interface PortfolioItem {
  id: string; // URL-friendly identifier used as DOM id, slug, and image paths (e.g., 'samsung-brand-identity')
  title: LocalizedContent;
  client: string; // Client name (displayed in both languages)
  mediaType: string;
  mission: LocalizedContent;
  solution: LocalizedContent;
  videoUrl?: string; // Optional YouTube URL to show instead of images
}

export type PortfolioData = PortfolioItem[];

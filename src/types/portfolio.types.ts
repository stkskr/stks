import { LocalizedContent } from './content.types';

export interface PortfolioItem {
  id: string; // URL-friendly identifier used as DOM id, slug, and image paths (e.g., 'samsung-brand-identity')
  title: LocalizedContent;
  client: string; // Client name (displayed in both languages)
  mediaType: string;
  mission: LocalizedContent;
  solution: LocalizedContent;
  videoUrl?: string; // Optional YouTube URL to show instead of images
  imagePrefix?: string | null; // Image file prefix (e.g., '01', '14') - null if no images exist
  carouselCount?: number; // Number of carousel images (0 for single image, 2+ for carousel)
}

export type PortfolioData = PortfolioItem[];

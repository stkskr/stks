/**
 * Utility functions for portfolio image path handling
 * Optimized version using static mapping instead of runtime discovery
 */

import { portfolioData } from '../data/portfolio';

// Placeholder SVG for items without images
const PLACEHOLDER_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f0f0f0" width="800" height="600"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

/**
 * Get thumbnail path from portfolio item id using pre-mapped data (synchronous)
 * @param id - Portfolio item id (e.g., 'lifes-good')
 * @returns Thumbnail path
 */
export function getThumbnailPath(id: string): string {
  const item = portfolioData.find(item => item.id === id);

  if (!item || !item.imagePrefix) {
    return PLACEHOLDER_SVG;
  }

  return `/assets/portfolio/thumbnails/${item.imagePrefix}_${id}.jpg`;
}

/**
 * Get the base path for slider images (without number prefix or carousel suffix)
 * @param id - Portfolio item id (e.g., 'lifes-good')
 * @returns Base path pattern (e.g., '/assets/portfolio/slider/*_lifes-good')
 */
export function getFullImageBasePath(id: string): string {
  const item = portfolioData.find(item => item.id === id);

  if (!item || !item.imagePrefix) {
    return `/assets/portfolio/slider/*_${id}`;
  }

  return `/assets/portfolio/slider/${item.imagePrefix}_${id}`;
}

/**
 * Get all carousel images for a portfolio item using pre-mapped data (synchronous)
 * Returns single image if carouselCount is 0, multiple images if carousel exists
 *
 * @param id - Portfolio item id
 * @returns Array of image paths
 */
export function getFullImages(id: string): string[] {
  const item = portfolioData.find(item => item.id === id);

  if (!item || !item.imagePrefix) {
    return [];
  }

  const basePattern = `/assets/portfolio/slider/${item.imagePrefix}_${id}`;
  const carouselCount = item.carouselCount || 0;

  // Single image
  if (carouselCount === 0) {
    return [`${basePattern}.jpg`];
  }

  // Build carousel image array
  const images: string[] = [];
  for (let i = 1; i <= carouselCount; i++) {
    const paddedNum = String(i).padStart(2, '0');
    images.push(`${basePattern}_${paddedNum}.jpg`);
  }

  return images;
}

/**
 * Check if portfolio item has images
 */
export function hasImages(id: string): boolean {
  const item = portfolioData.find(item => item.id === id);
  return !!(item && item.imagePrefix);
}

/**
 * Synchronously get the most likely slider image path (for initial render)
 * Use getFullImages() for accurate carousel detection
 */
export function getDefaultFullImagePath(id: string): string {
  const item = portfolioData.find(item => item.id === id);

  if (!item || !item.imagePrefix) {
    return PLACEHOLDER_SVG;
  }

  return `/assets/portfolio/slider/${item.imagePrefix}_${id}.jpg`;
}

/**
 * Preload critical images for performance
 */
export function preloadImage(url: string): void {
  if (url === PLACEHOLDER_SVG) return; // Don't preload placeholder

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Utility functions for portfolio image path handling
 * Automatically detects image prefixes and carousel counts from file names
 */

// Placeholder SVG for items without images
const PLACEHOLDER_SVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600"%3E%3Crect fill="%23f0f0f0" width="800" height="600"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';

// Cache for discovered image paths
const imageCache = new Map<string, string>();
const carouselCache = new Map<string, string[]>();

/**
 * Check if an image exists at the given URL
 */
async function imageExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Find thumbnail image by trying different prefixes (01-99)
 * @param id - Portfolio item id (e.g., 'lifes-good')
 * @returns Thumbnail path or placeholder
 */
export async function getThumbnailPath(id: string): Promise<string> {
  // Check cache first
  if (imageCache.has(id)) {
    return imageCache.get(id)!;
  }

  // Try prefixes from 01 to 99
  for (let i = 1; i <= 99; i++) {
    const prefix = String(i).padStart(2, '0');
    const path = `/assets/portfolio/thumbnails/${prefix}_${id}.jpg`;

    if (await imageExists(path)) {
      imageCache.set(id, path);
      return path;
    }
  }

  // No image found, return placeholder
  const placeholder = PLACEHOLDER_SVG;
  imageCache.set(id, placeholder);
  return placeholder;
}

/**
 * Find slider images by trying different prefixes and carousel patterns
 * @param id - Portfolio item id
 * @returns Array of image paths (single image or carousel)
 */
export async function getFullImages(id: string): Promise<string[]> {
  // Check cache first
  if (carouselCache.has(id)) {
    return carouselCache.get(id)!;
  }

  // Try to find the base image with any prefix (01-99)
  for (let i = 1; i <= 99; i++) {
    const prefix = String(i).padStart(2, '0');
    const basePath = `/assets/portfolio/slider/${prefix}_${id}`;

    // First check if there's a single image
    const singleImagePath = `${basePath}.jpg`;
    if (await imageExists(singleImagePath)) {
      // Check if there are carousel images (_01, _02, etc.)
      const carouselImages: string[] = [];
      for (let j = 1; j <= 20; j++) {
        // Check up to 20 carousel images
        const carouselNum = String(j).padStart(2, '0');
        const carouselPath = `${basePath}_${carouselNum}.jpg`;

        if (await imageExists(carouselPath)) {
          carouselImages.push(carouselPath);
        } else {
          break; // Stop when we don't find the next image
        }
      }

      // If we found carousel images, use those; otherwise use single image
      const result = carouselImages.length > 0 ? carouselImages : [singleImagePath];
      carouselCache.set(id, result);
      return result;
    }
  }

  // No images found
  carouselCache.set(id, []);
  return [];
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

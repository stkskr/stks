/**
 * Utility functions for portfolio image path handling
 */

/**
 * Get thumbnail path from portfolio item id
 * Searches for thumbnail with pattern: XX_id.jpg (where XX is 01-99)
 * @param id - Portfolio item id (e.g., 'lifes-good')
 * @returns Promise resolving to thumbnail path
 */
export async function getThumbnailPath(id: string): Promise<string> {
  const basePattern = `/assets/portfolio/thumbnails/`;

  // Try to find thumbnail with number prefix (01-99)
  for (let prefix = 1; prefix <= 99; prefix++) {
    const prefixPadded = String(prefix).padStart(2, '0');
    const thumbnailPath = `${basePattern}${prefixPadded}_${id}.jpg`;

    if (await imageExists(thumbnailPath)) {
      return thumbnailPath;
    }
  }

  // Fallback: return default path even if it doesn't exist
  return `${basePattern}01_${id}.jpg`;
}

/**
 * Get the base path for full images (without number prefix or carousel suffix)
 * @param id - Portfolio item id (e.g., 'lifes-good')
 * @returns Base path pattern (e.g., '/assets/portfolio/full/*_lifes-good')
 */
export function getFullImageBasePath(id: string): string {
  return `/assets/portfolio/full/*_${id}`;
}

/**
 * Get all carousel images for a portfolio item
 * Checks for images with pattern: XX_id_01.jpg, XX_id_02.jpg, etc.
 * If no carousel images found, returns single image: XX_id.jpg
 *
 * @param id - Portfolio item id
 * @returns Array of image paths (single item if no carousel, multiple if carousel exists)
 */
export async function getFullImages(id: string): Promise<string[]> {
  const basePattern = `/assets/portfolio/full/`;

  // Try to find carousel images by attempting to load _01, _02, etc.
  const carouselImages: string[] = [];

  // Check up to 10 potential carousel images
  for (let i = 1; i <= 10; i++) {
    const paddedNum = String(i).padStart(2, '0');
    // Try different prefixes (01-99)
    for (let prefix = 1; prefix <= 99; prefix++) {
      const prefixPadded = String(prefix).padStart(2, '0');
      const carouselPath = `${basePattern}${prefixPadded}_${id}_${paddedNum}.jpg`;

      // Check if image exists
      if (await imageExists(carouselPath)) {
        carouselImages.push(carouselPath);
        break; // Found image with this suffix, move to next
      }
    }

    // If we didn't find this number, stop searching
    if (carouselImages.length !== i) {
      break;
    }
  }

  // If we found carousel images, return them
  if (carouselImages.length > 0) {
    return carouselImages;
  }

  // Otherwise, find the single image (XX_id.jpg)
  for (let prefix = 1; prefix <= 99; prefix++) {
    const prefixPadded = String(prefix).padStart(2, '0');
    const singlePath = `${basePattern}${prefixPadded}_${id}.jpg`;

    if (await imageExists(singlePath)) {
      return [singlePath];
    }
  }

  // Fallback: return default path even if it doesn't exist
  return [`${basePattern}01_${id}.jpg`];
}

/**
 * Check if an image exists at the given path
 */
function imageExists(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Synchronously get the most likely full image path (for initial render)
 * Use getFullImages() for accurate carousel detection
 */
export function getDefaultFullImagePath(id: string): string {
  return `/assets/portfolio/full/01_${id}.jpg`;
}

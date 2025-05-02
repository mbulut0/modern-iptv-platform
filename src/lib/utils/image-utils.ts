/**
 * Converts an external image URL to a proxied URL to avoid CORS issues
 * @param url The original image URL
 * @returns The proxied image URL
 */
export function getProxiedImageUrl(url: string | null | undefined): string {
  if (!url) {
    return '/placeholder-image.jpg'; // Return a placeholder image if URL is empty
  }

  // Check if the URL is already relative (our own domain)
  if (url.startsWith('/')) {
    return url;
  }

  // Encode the URL to make it safe for query parameters
  const encodedUrl = encodeURIComponent(url);
  return `/api/image-proxy?url=${encodedUrl}`;
}

/**
 * Gets a fallback image URL if the provided URL is invalid
 * @param url The original image URL
 * @param type The type of content (channel, movie, series)
 * @returns A fallback image URL
 */
export function getFallbackImageUrl(url: string | null | undefined, type: 'channel' | 'movie' | 'series'): string {
  if (url) {
    return getProxiedImageUrl(url);
  }

  // Return type-specific placeholder
  switch (type) {
    case 'channel':
      return '/placeholders/channel.png';
    case 'movie':
      return '/placeholders/movie.png';
    case 'series':
      return '/placeholders/series.png';
    default:
      return '/placeholders/default.png';
  }
}
/**
 * Utilities for locale conversion between frontend and Strapi
 */

// Map frontend locale codes to Strapi locale codes
const localeMap = {
  'en': 'en',      // English
  'br': 'pt-BR',   // Portuguese (Brazil)
  'es': 'es'       // Spanish
};

/**
 * Convert frontend locale code to Strapi locale code
 */
export function toStrapiLocale(frontendLocale: string): string {
  return localeMap[frontendLocale as keyof typeof localeMap] || 'en';
}

/**
 * Convert Strapi locale code to frontend locale code
 */
export function fromStrapiLocale(strapiLocale: string): string {
  const reverseMap = Object.entries(localeMap).find(([_, value]) => value === strapiLocale);
  return reverseMap ? reverseMap[0] : 'en';
}
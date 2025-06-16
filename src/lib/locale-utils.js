/**
 * Utilities for locale conversion between frontend and Strapi
 */
// Map frontend locale codes to Strapi locale codes
const localeMap = {
    'en': 'en', // English
    'br': 'pt-BR', // Portuguese (Brazil)
    'es': 'es' // Spanish
};
/**
 * Convert frontend locale code to Strapi locale code
 */
export function toStrapiLocale(frontendLocale) {
    return localeMap[frontendLocale] || 'en';
}
/**
 * Convert Strapi locale code to frontend locale code
 */
export function fromStrapiLocale(strapiLocale) {
    const reverseMap = Object.entries(localeMap).find(([_, value]) => value === strapiLocale);
    return reverseMap ? reverseMap[0] : 'en';
}

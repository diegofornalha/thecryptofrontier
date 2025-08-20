// Validation helpers
export function isDocument(value, type) {
    return (typeof value === 'object' &&
        value !== null &&
        '_type' in value &&
        value._type === type);
}
export function isReference(value) {
    return (typeof value === 'object' &&
        value !== null &&
        '_ref' in value &&
        typeof value._ref === 'string');
}
export function hasSlug(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'slug' in value &&
        typeof value.slug === 'object' &&
        'current' in value.slug);
}
// Type guards
export const isPost = (doc) => doc._type === 'post';
export const isPage = (doc) => doc._type === 'page';
export const isAuthor = (doc) => doc._type === 'author';
// Helper to create Result types
export const createResult = {
    success: (data) => ({ success: true, data }),
    error: (error) => ({ success: false, error }),
};

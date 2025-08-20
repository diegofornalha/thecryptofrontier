/**
 * Content utilities for MCP responses
 */
/**
 * Create a text content block
 */
export function createContentBlock(text) {
    return {
        type: 'text',
        text
    };
}
/**
 * Create an image content block
 */
export function createImageBlock(uri, mimeType = 'image/png') {
    return {
        type: 'image',
        uri,
        mimeType
    };
}
/**
 * Create a resource content block
 */
export function createResourceBlock(uri, mimeType) {
    return {
        type: 'resource',
        uri,
        mimeType
    };
}
/**
 * Convert any value to a content block array
 */
export function toContentBlocks(value) {
    if (typeof value === 'string') {
        return [createContentBlock(value)];
    }
    if (typeof value === 'object' && value !== null) {
        return [createContentBlock(JSON.stringify(value, null, 2))];
    }
    return [createContentBlock(String(value))];
}

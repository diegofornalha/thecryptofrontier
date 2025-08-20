/**
 * Content utilities for MCP responses
 */

import { ContentBlock } from '../core/types.js';

/**
 * Create a text content block
 */
export function createContentBlock(text: string): ContentBlock {
  return {
    type: 'text',
    text
  };
}

/**
 * Create an image content block
 */
export function createImageBlock(uri: string, mimeType: string = 'image/png'): ContentBlock {
  return {
    type: 'image',
    uri,
    mimeType
  };
}

/**
 * Create a resource content block
 */
export function createResourceBlock(uri: string, mimeType: string): ContentBlock {
  return {
    type: 'resource',
    uri,
    mimeType
  };
}

/**
 * Convert any value to a content block array
 */
export function toContentBlocks(value: any): ContentBlock[] {
  if (typeof value === 'string') {
    return [createContentBlock(value)];
  }
  
  if (typeof value === 'object' && value !== null) {
    return [createContentBlock(JSON.stringify(value, null, 2))];
  }
  
  return [createContentBlock(String(value))];
}
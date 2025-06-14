// Utility types for working with Strapi data
import type { strapiDocument, strapiReference, strapiImageAsset } from './strapi.generated'

// Extract document type from _type field
export type DocumentType<T extends strapiDocument> = T['_type']

// Make fields optional (useful for drafts)
export type PartialDocument<T extends strapiDocument> = Partial<T> & Pick<T, '_id' | '_type'>

// Resolve reference type
export type ResolveReference<T> = T extends strapiReference<infer U> ? U : T

// Array element type
export type ArrayElement<T> = T extends Array<infer U> ? U : never

// Portable Text types
export type PortableTextBlock = {
  _type: 'block'
  _key: string
  style?: string
  children: Array<{
    _type: 'span'
    _key: string
    text: string
    marks?: string[]
  }>
  markDefs?: Array<{
    _type: string
    _key: string
    [key: string]: any
  }>
  level?: number
  listItem?: string
}

// Image with resolved asset
export type ImageWithAsset = {
  _type: 'image'
  asset: strapiImageAsset & {
    url: string
    metadata: {
      dimensions: {
        width: number
        height: number
      }
    }
  }
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
  crop?: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

// Slug type
export type Slug = {
  _type: 'slug'
  current: string
}

// Reference with resolved data
export type ResolvedReference<T extends strapiDocument> = T & {
  _id: string
  _type: T['_type']
}

// Validation helpers
export function isDocument<T extends strapiDocument>(
  value: unknown,
  type: T['_type']
): value is T {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_type' in value &&
    (value as any)._type === type
  )
}

export function isReference<T extends strapiDocument>(
  value: unknown
): value is strapiReference<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_ref' in value &&
    typeof (value as any)._ref === 'string'
  )
}

export function hasSlug(value: unknown): value is { slug: Slug } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'slug' in value &&
    typeof (value as any).slug === 'object' &&
    'current' in (value as any).slug
  )
}

// Type guards
export const isPost = (doc: strapiDocument): doc is import('./strapi.generated').Post => 
  doc._type === 'post'

export const isPage = (doc: strapiDocument): doc is import('./strapi.generated').Page => 
  doc._type === 'page'

export const isAuthor = (doc: strapiDocument): doc is import('./strapi.generated').Author => 
  doc._type === 'author'

// Query result type helpers
export type QueryResult<T> = T | null

export type QueryArrayResult<T> = T[]

export type PaginatedResult<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Error handling types
export type strapiError = {
  message: string
  statusCode?: number
  error?: string
}

export type Result<T, E = strapiError> = 
  | { success: true; data: T }
  | { success: false; error: E }

// Helper to create Result types
export const createResult = {
  success: <T>(data: T): Result<T> => ({ success: true, data }),
  error: <E = strapiError>(error: E): Result<any, E> => ({ success: false, error }),
}
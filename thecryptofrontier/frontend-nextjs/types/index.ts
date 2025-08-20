// Re-export all type definitions
export * from './strapi.generated'
export * from './groq-queries'
export * from './strapi-utils'

// Common type aliases for convenience
export type { Post, Page, Author, SiteConfig, Header, Footer } from './strapi.generated'
export type { PostWithAuthor, PostPreview, PostsQueryParams } from './groq-queries'
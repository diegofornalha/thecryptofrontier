// Re-export all type definitions
export * from './sanity.generated'
export * from './groq-queries'
export * from './sanity-utils'

// Common type aliases for convenience
export type { Post, Page, Author, SiteConfig, Header, Footer } from './sanity.generated'
export type { PostWithAuthor, PostPreview, PostsQueryParams } from './groq-queries'
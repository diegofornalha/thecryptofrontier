// Queries GROQ otimizadas para performance

// Post fields comuns para evitar repetição
const postFields = `
  _id,
  title,
  "slug": slug.current,
  mainImage,
  publishedAt,
  excerpt
`;

const authorFields = `
  _id,
  name,
  image,
  role,
  "slug": slug.current,
  bio,
  social
`;

// Query para lista de posts com paginação (inclui posts normais e do agente)
export const POSTS_LIST_QUERY = `{
  "posts": *[_type in ["post", "agentPost"]] | order(publishedAt desc) [$start...$end] {
    ${postFields},
    _type,
    "author": author->{
      name
    },
    "estimatedReadingTime": round(length(pt::text(content)) / 5 / 180)
  },
  "total": count(*[_type in ["post", "agentPost"]])
}`;

// Query para post único (busca em ambos os tipos)
export const POST_QUERY = `*[_type in ["post", "agentPost"] && slug.current == $slug][0]{
  _id,
  title,
  slug,
  mainImage{
    asset,
    caption,
    alt,
    attribution
  },
  content,
  publishedAt,
  excerpt,
  author->{
    ${authorFields}
  },
  seo,
  originalSource
}`;

// Query para posts populares (sidebar)
export const POPULAR_POSTS_QUERY = `*[_type == "post"] | order(views desc, publishedAt desc) [0...5] {
  ${postFields},
  "author": author->{
    name
  }
}`;

// Query para posts relacionados (simplificada para pegar os mais recentes)
export const RELATED_POSTS_QUERY = `*[
  _type == "post" && 
  _id != $currentPostId
] | order(publishedAt desc) [0...3] {
  ${postFields}
}`;

// Query para busca
export const SEARCH_POSTS_QUERY = `*[_type == "post" && (
  title match $searchTerm + "*" ||
  excerpt match $searchTerm + "*" ||
  pt::text(content) match $searchTerm + "*"
)] | order(publishedAt desc) [$start...$end] {
  ${postFields},
  "author": author->{
    name
  }
}`;

// Query para sitemap
export const SITEMAP_QUERY = `{
  "posts": *[_type == "post"] | order(publishedAt desc) {
    "slug": slug.current,
    publishedAt,
    _updatedAt
  }
}`;
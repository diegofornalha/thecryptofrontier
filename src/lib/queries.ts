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

const categoryFields = `
  _id,
  title,
  "slug": slug.current
`;

const tagFields = `
  _id,
  title,
  "slug": slug.current
`;

// Query para lista de posts com paginação (inclui posts normais e do agente)
export const POSTS_LIST_QUERY = `{
  "posts": *[_type in ["post", "agentPost"]] | order(publishedAt desc) [$start...$end] {
    ${postFields},
    _type,
    "author": author->{
      name
    },
    "categories": categories[0..2]->{ 
      ${categoryFields}
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
  categories[]->{
    ${categoryFields},
    description
  },
  tags[]->{
    ${tagFields}
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

// Query para posts relacionados
export const RELATED_POSTS_QUERY = `*[
  _type == "post" && 
  _id != $currentPostId && 
  count(categories[@._ref in $categoryIds]) > 0
] | order(publishedAt desc) [0...3] {
  ${postFields},
  "categories": categories[0..1]->{ 
    ${categoryFields}
  }
}`;

// Query para categorias com contagem
export const CATEGORIES_WITH_COUNT_QUERY = `*[_type == "category"] | order(title asc) {
  ${categoryFields},
  "postCount": count(*[_type == "post" && references(^._id)])
}`;

// Query para tags populares
export const POPULAR_TAGS_QUERY = `*[_type == "tag"] | order(count(*[_type == "post" && references(^._id)]) desc) [0...10] {
  ${tagFields},
  "postCount": count(*[_type == "post" && references(^._id)])
}`;

// Query para posts por categoria
export const POSTS_BY_CATEGORY_QUERY = `{
  "category": *[_type == "category" && slug.current == $slug][0]{
    ${categoryFields},
    description
  },
  "posts": *[_type == "post" && references(*[_type == "category" && slug.current == $slug]._id)] | order(publishedAt desc) [$start...$end] {
    ${postFields},
    "author": author->{
      name
    },
    "categories": categories[0..2]->{ 
      ${categoryFields}
    },
    "estimatedReadingTime": round(length(pt::text(content)) / 5 / 180)
  },
  "total": count(*[_type == "post" && references(*[_type == "category" && slug.current == $slug]._id)])
}`;

// Query para posts por tag
export const POSTS_BY_TAG_QUERY = `{
  "tag": *[_type == "tag" && slug.current == $slug][0]{
    ${tagFields}
  },
  "posts": *[_type == "post" && references(*[_type == "tag" && slug.current == $slug]._id)] | order(publishedAt desc) [$start...$end] {
    ${postFields},
    "author": author->{
      name
    },
    "categories": categories[0..2]->{ 
      ${categoryFields}
    },
    "estimatedReadingTime": round(length(pt::text(content)) / 5 / 180)
  },
  "total": count(*[_type == "post" && references(*[_type == "tag" && slug.current == $slug]._id)])
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
  },
  "categories": categories[0..2]->{ 
    ${categoryFields}
  }
}`;

// Query para sitemap
export const SITEMAP_QUERY = `{
  "posts": *[_type == "post"] | order(publishedAt desc) {
    "slug": slug.current,
    publishedAt,
    _updatedAt
  },
  "categories": *[_type == "category"] {
    "slug": slug.current,
    _updatedAt
  },
  "tags": *[_type == "tag"] {
    "slug": slug.current,
    _updatedAt
  }
}`;
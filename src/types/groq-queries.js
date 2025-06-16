// Common GROQ queries
export const GROQ_QUERIES = {
    // Get all posts with author
    postsWithAuthor: `
    *[_type == "post"] | order(publishedAt desc) {
      ...,
      author->
    }
  `,
    // Get single post by slug with full details
    postBySlug: `
    *[_type == "post" && slug.current == $slug][0] {
      ...,
      author->,
      relatedPosts[]->{
        ...,
        author->
      },
      "readingTime": round(length(pt::text(content)) / 5 / 180)
    }
  `,
    // Get posts preview (for listing pages)
    postsPreview: `
    *[_type == "post"] | order(publishedAt desc) [$start...$end] {
      _id,
      _type,
      title,
      slug,
      excerpt,
      publishedAt,
      mainImage,
      author->{
        _id,
        name,
        image
      }
    }
  `,
    // Get featured posts
    featuredPosts: `
    *[_type == "post" && featured == true] | order(publishedAt desc) [0...$limit] {
      ...,
      author->
    }
  `,
    // Get posts by author
    postsByAuthor: `
    *[_type == "post" && author._ref == $authorId] | order(publishedAt desc) {
      ...,
      author->
    }
  `,
    // Search posts
    searchPosts: `
    *[_type == "post" && (
      title match $query + "*" ||
      excerpt match $query + "*" ||
      pt::text(content) match $query + "*"
    )] | order(publishedAt desc) [0...$limit] {
      ...,
      author->
    }
  `,
    // Get author by slug
    authorBySlug: `
    *[_type == "author" && slug.current == $slug][0] {
      ...,
      "postCount": count(*[_type == "post" && author._ref == ^._id])
    }
  `,
    // Get site config
    siteConfig: `*[_type == "siteConfig"][0]`,
    // Get header config
    headerConfig: `*[_type == "header"][0]`,
    // Get footer config
    footerConfig: `*[_type == "footer"][0]`,
    // Get page by slug
    pageBySlug: `
    *[_type == "page" && slug.current == $slug][0] {
      ...,
      "seo": seo {
        ...,
        "ogImage": openGraphImage.asset->url
      }
    }
  `,
    // Get recent posts count
    recentPostsCount: `
    count(*[_type == "post" && publishedAt > $since])
  `,
    // Get post stats
    postStats: `
    {
      "total": count(*[_type == "post"]),
      "published": count(*[_type == "post" && defined(publishedAt)]),
      "featured": count(*[_type == "post" && featured == true]),
      "withImages": count(*[_type == "post" && defined(mainImage)])
    }
  `,
};
// Helper function to create typed queries
export function createTypedQuery(query) {
    return (params) => ({
        query,
        params,
    });
}

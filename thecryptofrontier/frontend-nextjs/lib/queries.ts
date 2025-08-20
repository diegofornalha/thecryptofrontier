// Queries simples para sitemap
export const SITEMAP_QUERY = {
  posts: async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts?fields[0]=slug&fields[1]=publishedAt`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
        },
      });
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching posts for sitemap:', error);
      return [];
    }
  }
};

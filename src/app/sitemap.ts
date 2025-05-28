import { MetadataRoute } from 'next';
import { client } from '@/sanity/lib/client';
import { SITEMAP_QUERY } from '@/lib/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thecryptofrontier.com';

  // Buscar dados do Sanity
  const data = await client.fetch(SITEMAP_QUERY, {}, {
    next: { revalidate: 3600 } // Cache por 1 hora
  });

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/buscas`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Posts dinâmicos
  const posts: MetadataRoute.Sitemap = data.posts.map((post: any) => ({
    url: `${baseUrl}/post/${post.slug}`,
    lastModified: new Date(post._updatedAt || post.publishedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Categorias
  const categories: MetadataRoute.Sitemap = data.categories.map((category: any) => ({
    url: `${baseUrl}/categoria/${category.slug}`,
    lastModified: new Date(category._updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Tags
  const tags: MetadataRoute.Sitemap = data.tags.map((tag: any) => ({
    url: `${baseUrl}/tag/${tag.slug}`,
    lastModified: new Date(tag._updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...posts, ...categories, ...tags];
}
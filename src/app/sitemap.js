import { client } from '@/strapi/lib/client';
import { SITEMAP_QUERY } from '@/lib/queries';
export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thecryptofrontier.com';
    // Buscar dados do Strapi
    const data = await client.fetch(SITEMAP_QUERY);
    // Páginas estáticas
    const staticPages = [
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
    const posts = data.posts.map((post) => ({
        url: `${baseUrl}/post/${post.slug}`,
        lastModified: new Date(post._updatedAt || post.publishedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
    }));
    return [...staticPages, ...posts];
}

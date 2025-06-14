import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { urlForImage } from '@/strapi/lib/image';
import { client } from '@/strapi/lib/client';

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: any;
  excerpt?: string;
  publishedAt: string;
  categories?: Array<{
    _id: string;
    title: string;
  }>;
}

interface RelatedPostsProps {
  currentPostId: string;
  categories?: string[];
}

async function getRelatedPosts(currentPostId: string, categoryIds: string[] = []): Promise<Post[]> {
  const query = `*[_type == "post" && _id != $currentPostId && count(categories[@._ref in $categoryIds]) > 0] | order(publishedAt desc) [0...3] {
    _id,
    title,
    "slug": slug.current,
    mainImage,
    excerpt,
    publishedAt,
    "categories": categories[]->{ 
      _id,
      title
    }
  }`;

  try {
    const posts = await client.fetch(query, { currentPostId, categoryIds });
    return posts || [];
  } catch (error) {
    console.error('Erro ao buscar posts relacionados:', error);
    return [];
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const RelatedPosts: React.FC<RelatedPostsProps> = async ({ currentPostId, categories = [] }) => {
  const relatedPosts = await getRelatedPosts(currentPostId, categories);

  if (relatedPosts.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-[#111] mb-6">Artigos Relacionados</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <article key={post._id} className="group">
            <Link href={`/post/${post.slug}`}>
              {/* Imagem */}
              {post.mainImage && (
                <div className="relative w-full h-48 mb-4 overflow-hidden rounded">
                  <Image
                    src={urlForImage(post.mainImage).width(400).height(300).url()}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              {/* Categoria */}
              {post.categories && post.categories[0] && (
                <span className="text-[#4db2ec] text-xs font-medium uppercase">
                  {post.categories[0].title}
                </span>
              )}
              
              {/* Título */}
              <h3 className="text-lg font-bold text-[#111] mt-2 mb-2 line-clamp-2 group-hover:text-[#4db2ec] transition-colors">
                {post.title}
              </h3>
              
              {/* Data */}
              <p className="text-xs text-[#999]">
                {formatDate(post.publishedAt)}
              </p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;
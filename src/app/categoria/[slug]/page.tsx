import React from 'react';
import { client } from '@/sanity/lib/client';
import { notFound } from 'next/navigation';
import ThreeColumnLayout from '@/components/layouts/ThreeColumnLayout';
import CryptoNewsCard from '@/components/sections/CryptoNewsCard';
import { 
  PopularPostsWidget
} from '@/components/widgets';
import { Metadata } from 'next';

interface PageProps {
  params: {
    slug: string;
  };
}

// Query para buscar a categoria
const CATEGORY_QUERY = `*[_type == "category" && slug.current == $slug][0]{
  _id,
  title,
  description,
  "slug": slug.current
}`;

// Query para buscar posts da categoria
const POSTS_BY_CATEGORY_QUERY = `*[_type == "post" && references($categoryId)] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  publishedAt,
  author-> {
    name
  },
  category-> {
    title,
    "slug": slug.current
  },
  "readTime": round(length(pt::text(content)) / 5 / 180)
}`;

interface Category {
  _id: string;
  title: string;
  description?: string;
  slug: string;
}

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: any;
  publishedAt?: string;
  author?: {
    firstName?: string;
    lastName?: string;
  };
  category?: {
    title: string;
    slug: string;
  };
  readTime?: number;
}

// Função para buscar categoria
async function getCategory(slug: string): Promise<Category | null> {
  try {
    const category = await client.fetch(CATEGORY_QUERY, { slug });
    return category;
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return null;
  }
}

// Função para buscar posts da categoria
async function getPostsByCategory(categoryId: string): Promise<Post[]> {
  try {
    const posts = await client.fetch(POSTS_BY_CATEGORY_QUERY, { categoryId });
    return posts || [];
  } catch (error) {
    console.error('Erro ao buscar posts da categoria:', error);
    return [];
  }
}

// Gerar metadata dinâmica
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const category = await getCategory(params.slug);
  
  if (!category) {
    return {
      title: 'Categoria não encontrada',
    };
  }

  return {
    title: `${category.title} - The Crypto Frontier`,
    description: category.description || `Últimas notícias e artigos sobre ${category.title}`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const category = await getCategory(params.slug);
  
  if (!category) {
    notFound();
  }

  const posts = await getPostsByCategory(category._id);

  const sidebar = (
    <>
      <PopularPostsWidget />
    </>
  );

  return (
    <ThreeColumnLayout
      title={category.title}
      breadcrumbs={[
        { label: 'Categorias', href: '/categorias' },
        { label: category.title }
      ]}
      sidebar={sidebar}
    >
      {category.description && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700">{category.description}</p>
        </div>
      )}

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <CryptoNewsCard 
              key={post._id} 
              {...post}
              authorName={post.author?.name}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-[#111] mb-4">
            Nenhum post encontrado nesta categoria
          </h2>
          <p className="text-[#666]">
            Em breve teremos novos conteúdos sobre {category.title}.
          </p>
        </div>
      )}
    </ThreeColumnLayout>
  );
}
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '../../sanity/lib/client';
import { urlForImage } from '../../sanity/lib/image';
import CryptoBasicFooter from '@/components/sections/CryptoBasicFooter';
import NewsHeader from '../../components/sections/NewsHeader';
import BreakingNewsTicker from '@/components/sections/home/BreakingNewsTicker';
import CryptoNewsCard from '@/components/sections/CryptoNewsCard';
import Pagination from '@/components/ui/pagination';
import CategoriesWidget from '@/components/widgets/CategoriesWidget';
import NewsletterWidget from '@/components/widgets/NewsletterWidget';
import { POSTS_LIST_QUERY } from '@/lib/queries';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - The Crypto Frontier',
  description: 'Artigos, tutoriais e notícias sobre o mundo das criptomoedas e blockchain. Fique atualizado com as últimas tendências do mercado cripto.',
};

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Constants for pagination
const POSTS_PER_PAGE = 12;

// Interface para os posts
interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: {
    alt?: string;
    asset?: {
      _ref: string;
    };
  };
  publishedAt: string;
  excerpt?: string;
  author?: {
    name?: string;
    image?: any;
    role?: string;
  };
  categories?: Array<{
    _id: string;
    title: string;
    slug: { current: string };
  }>;
  tags?: Array<{
    _id: string;
    title: string;
    slug: { current: string };
  }>;
  cryptoData?: {
    coinName?: string;
    coinSymbol?: string;
    currentPrice?: number;
    priceChange24h?: number;
  };
  estimatedReadingTime?: number;
}

// Função para formatar data
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Função para formatar o preço em BRL
const formatPrice = (price?: number) => {
  if (!price) return '';
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(price);
};

// Função para buscar os posts com paginação
async function getPosts(page: number = 1): Promise<{ posts: Post[], total: number }> {
  try {
    const start = (page - 1) * POSTS_PER_PAGE;
    const end = start + POSTS_PER_PAGE;
    const result = await client.fetch(POSTS_LIST_QUERY, { start, end }, {
      // Cache por 5 minutos
      next: { revalidate: 300 }
    });
    return {
      posts: result.posts || [],
      total: result.total || 0
    };
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return { posts: [], total: 0 };
  }
}

// Interface para searchParams
interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

// Componente da página do blog (Server Component)
export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page) : 1;
  const { posts, total } = await getPosts(currentPage);
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);
  
  // Links de navegação
  const navLinks = [
    { label: "Home", url: "/" },
    { label: "Buscar", url: "/buscas" },
    { label: "Blog", url: "/blog" },
    { label: "Studio", url: "/studio" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <NewsHeader />
      
      {/* Layout padrão The Crypto Basic */}
      <div className="pt-[70px]">
        {/* Breaking News Ticker */}
        <BreakingNewsTicker />
        
        {/* Breadcrumb */}
        <div className="border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <a href="/" className="hover:text-[#4db2ec] transition-colors">Home</a>
              <span className="text-gray-400">›</span>
              <span className="text-gray-900">Blog</span>
            </nav>
          </div>
        </div>

        {/* Header simples */}
        <div className="py-8 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-[#111]">
              Últimas Notícias
            </h1>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Conteúdo principal (8 cols) */}
          <div className="lg:col-span-8">
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <CryptoNewsCard
                    key={post._id}
                    title={post.title}
                    slug={post.slug.current}
                    excerpt={post.excerpt}
                    coverImage={post.mainImage}
                    author={{
                      firstName: post.author?.name?.split(' ')[0],
                      lastName: post.author?.name?.split(' ').slice(1).join(' ')
                    }}
                    publishedAt={post.publishedAt}
                    category={post.categories?.[0] ? {
                      title: post.categories[0].title,
                      slug: post.categories[0].slug.current
                    } : undefined}
                    readTime={post.estimatedReadingTime}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-[#111] mb-4">Nenhum post encontrado</h2>
                <p className="text-[#666] mb-8">Em breve teremos novos artigos.</p>
                <Button asChild>
                  <Link href="/buscas">
                    🔍 Fazer uma busca
                  </Link>
                </Button>
              </div>
            )}
            
            {/* Pagination */}
            {posts.length > 0 && totalPages > 1 && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl="/blog"
              />
            )}
          </div>

          {/* Sidebar (4 cols) */}
          <aside className="lg:col-span-4">
            {/* Widget de categorias */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold text-[#111] mb-4 pb-2 border-b border-gray-200">
                Categorias
              </h3>
              <ul className="space-y-2">
                {['Bitcoin', 'Ethereum', 'Altcoins', 'DeFi', 'NFTs', 'Blockchain', 'Trading', 'Análises'].map((cat) => (
                  <li key={cat}>
                    <a
                      href={`/categoria/${cat.toLowerCase()}`}
                      className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded transition-colors"
                    >
                      <span className="text-[#666] hover:text-[#4db2ec]">{cat}</span>
                      <span className="text-sm text-gray-400">(0)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Widget newsletter */}
            <div className="bg-[#4db2ec] rounded-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Newsletter</h3>
              <p className="text-sm mb-4 opacity-90">
                Receba as últimas notícias cripto no seu e-mail
              </p>
              <form>
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="w-full px-4 py-2 rounded text-gray-800 mb-3"
                />
                <button
                  type="submit"
                  className="w-full bg-white text-[#4db2ec] font-bold py-2 rounded hover:bg-gray-100 transition-colors"
                >
                  Inscrever
                </button>
              </form>
            </div>
          </aside>
        </div>
      </main>
      
      <CryptoBasicFooter />
    </div>
  );
}
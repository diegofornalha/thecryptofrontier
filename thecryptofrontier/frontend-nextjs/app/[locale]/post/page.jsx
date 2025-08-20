import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PostCard from '@/components/post/PostCard';
import { toStrapiLocale } from '@/lib/locale-utils';

export const dynamic = 'force-dynamic';

// Traduções da página
const translations = {
  en: {
    title: "Cryptocurrency Posts",
    subtitle: "Latest news and analysis about the crypto world",
    noPosts: "No posts found",
    noPostsMessage: "There are no published posts in this language yet.",
    home: "Home",
    posts: "Posts"
  },
  br: {
    title: "Posts de Criptomoedas",
    subtitle: "Últimas notícias e análises sobre o mundo cripto",
    noPosts: "Nenhum post encontrado",
    noPostsMessage: "Ainda não há posts publicados neste idioma.",
    home: "Home",
    posts: "Posts"
  },
  es: {
    title: "Posts de Criptomonedas",
    subtitle: "Últimas noticias y análisis sobre el mundo cripto",
    noPosts: "No se encontraron posts",
    noPostsMessage: "Aún no hay posts publicados en este idioma.",
    home: "Inicio",
    posts: "Posts"
  }
};

async function fetchPosts(locale) {
  try {
    const strapiLocale = toStrapiLocale(locale);
    console.log('Buscando posts SSR para locale:', locale, '-> Strapi locale:', strapiLocale);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts?populate=*&locale=${strapiLocale}&sort=publishedAt:desc`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
      },
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Posts encontrados SSR:', data.data?.length || 0);
      return data.data || [];
    } else {
      console.error('Erro na resposta da API SSR:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Erro ao carregar posts SSR:', error);
    return [];
  }
}

export default async function PostsPage({ params }) {
  const { locale } = params;
  const t = translations[locale] || translations.en;
  const posts = await fetchPosts(locale);

    return (
        <div className="min-h-screen bg-white">
            <Header />
            
            {/* Breadcrumb */}
            <div className="border-b border-gray-200 py-3">
                <div className="max-w-7xl mx-auto px-4">
                    <nav className="flex items-center space-x-2 text-sm text-gray-600">
                        <a href="/" className="hover:text-blue-600 transition-colors">{t.home}</a>
                        <span className="text-gray-400">›</span>
                        <span className="text-gray-900">{t.posts}</span>
                    </nav>
                </div>
            </div>

            {/* Header da página */}
            <div className="py-8 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {t.title}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {t.subtitle}
                    </p>
                </div>
            </div>
            
            <main className="max-w-7xl mx-auto px-4 py-8">
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                locale={locale}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{t.noPosts}</h3>
                        <p className="text-gray-600">
                            {t.noPostsMessage}
                        </p>
                </div>
                )}
            </main>
            
            <Footer />
        </div>
    );
} 
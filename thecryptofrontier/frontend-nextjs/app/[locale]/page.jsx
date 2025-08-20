import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PostCard from '@/components/post/PostCard';
import { toStrapiLocale } from '@/lib/locale-utils';

// Traduções da home page
const translations = {
    en: {
        title: "Latest News",
        subtitle: "Stay updated with the latest trends and developments in the world of cryptocurrencies."
    },
    br: {
        title: "Últimas Notícias", 
        subtitle: "Mantenha-se atualizado com as últimas tendências e desenvolvimentos no mundo das criptomoedas."
    },
    es: {
        title: "Últimas Noticias",
        subtitle: "Manténgase actualizado con las últimas tendencias y desarrollos en el mundo de las criptomonedas."
    }
};

async function fetchPosts(locale) {
    try {
        // Converter locale do frontend para o formato do Strapi
        const strapiLocale = toStrapiLocale(locale);
        console.log('Buscando posts SSR home para locale:', locale, '-> Strapi locale:', strapiLocale);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts?populate=*&locale=${strapiLocale}&sort=publishedAt:desc`, {
                    headers: {
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
                    },
            cache: 'no-store'
                });
                
                if (response.ok) {
                    const data = await response.json();
            console.log('Posts encontrados SSR home:', data.data?.length || 0);
            return data.data || [];
        } else {
            console.error('Erro na resposta da API SSR home:', response.status);
            return [];
                }
            } catch (error) {
        console.error('Erro ao carregar posts SSR home:', error);
        return [];
    }
}

export default async function HomePage({ params }) {
    const { locale } = params;
    const posts = await fetchPosts(locale);
    
    // Obter traduções para o idioma atual
    const t = translations[locale] || translations.en;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <main>

                {/* Posts em Destaque */}
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
                                {t.title}
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                {t.subtitle}
                            </p>
                        </div>

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
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts available</h3>
                                <p className="text-gray-600">
                                    Posts will appear here when published in Strapi.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}

import React from 'react';
import Link from 'next/link';
import strapiClient from '@/lib/strapiClient';
import CryptoBasicFooter from '@/components/sections/CryptoBasicFooter';
import NewsHeader from '../../components/sections/NewsHeader';
import BreakingNewsTicker from '@/components/sections/home/breaking-news-ticker';
import CryptoNewsCard from '@/components/sections/CryptoNewsCard';
import Pagination from '@/components/ui/pagination';
import PopularPostsWidget from '@/components/widgets/popular-posts-widget';
export const metadata = {
    title: 'Blog - The Crypto Frontier',
    description: 'Artigos, tutoriais e notícias sobre o mundo das criptomoedas e blockchain. Fique atualizado com as últimas tendências do mercado cripto.',
};
import { Button } from "@/components/ui/button";
// Constants for pagination
const POSTS_PER_PAGE = 12;
// Função para formatar data
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
// Função para formatar o preço em BRL
const formatPrice = (price) => {
    if (!price)
        return '';
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(price);
};
// Função para buscar os posts com paginação
async function getPosts(page = 1) {
    var _a, _b;
    try {
        const start = (page - 1) * POSTS_PER_PAGE;
        const end = start + POSTS_PER_PAGE;
        const result = await strapiClient.getPosts({
            page: page,
            pageSize: POSTS_PER_PAGE,
            sort: 'publishedAt:desc',
            status: 'published'
        });
        // Mapear os dados do Strapi para o formato esperado
        const posts = (result.data || []).map((post) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            return ({
                _id: String(post.id),
                title: ((_a = post.attributes) === null || _a === void 0 ? void 0 : _a.title) || post.title || '',
                slug: ((_b = post.attributes) === null || _b === void 0 ? void 0 : _b.slug) || post.slug || '',
                publishedAt: ((_c = post.attributes) === null || _c === void 0 ? void 0 : _c.publishedAt) || post.publishedAt || new Date().toISOString(),
                excerpt: ((_d = post.attributes) === null || _d === void 0 ? void 0 : _d.excerpt) || post.excerpt,
                author: ((_f = (_e = post.attributes) === null || _e === void 0 ? void 0 : _e.author) === null || _f === void 0 ? void 0 : _f.data) ? {
                    name: post.attributes.author.data.attributes.name,
                    role: post.attributes.author.data.attributes.role
                } : post.author ? { name: post.author } : undefined,
                categories: ((_g = post.attributes) === null || _g === void 0 ? void 0 : _g.categories) || post.categories,
                tags: ((_h = post.attributes) === null || _h === void 0 ? void 0 : _h.tags) || post.tags,
                estimatedReadingTime: ((_j = post.attributes) === null || _j === void 0 ? void 0 : _j.readingTime) || post.readingTime || 5,
                featuredImageUrl: ((_k = post.featuredImage) === null || _k === void 0 ? void 0 : _k.url) || ((_m = (_l = post.attributes) === null || _l === void 0 ? void 0 : _l.featuredImage) === null || _m === void 0 ? void 0 : _m.url)
            });
        });
        return {
            posts,
            total: ((_b = (_a = result.meta) === null || _a === void 0 ? void 0 : _a.pagination) === null || _b === void 0 ? void 0 : _b.total) || 0
        };
    }
    catch (error) {
        console.error('Erro ao buscar posts:', error);
        return { posts: [], total: 0 };
    }
}
// Componente da página do blog (Server Component)
export default async function BlogPage({ searchParams }) {
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
    return (<div className="min-h-screen bg-white">
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
            {posts.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post, index) => {
                var _a, _b;
                const key = post._id || `post-${index}`;
                return (<CryptoNewsCard key={key} title={post.title} slug={post.slug} excerpt={post.excerpt} coverImage={post.mainImage} featuredImageUrl={post.featuredImageUrl} authorName={(_a = post.author) === null || _a === void 0 ? void 0 : _a.name} publishedAt={post.publishedAt} category={((_b = post.categories) === null || _b === void 0 ? void 0 : _b[0]) ? {
                        title: post.categories[0].title,
                        slug: post.categories[0].slug
                    } : undefined} readTime={post.estimatedReadingTime}/>);
            })}
              </div>) : (<div className="text-center py-12">
                <h2 className="text-2xl font-bold text-[#111] mb-4">Nenhum post encontrado</h2>
                <p className="text-[#666] mb-8">Em breve teremos novos artigos.</p>
                <Button asChild>
                  <Link href="/buscas">
                    🔍 Fazer uma busca
                  </Link>
                </Button>
              </div>)}
            
            {/* Pagination */}
            {posts.length > 0 && totalPages > 1 && (<Pagination currentPage={currentPage} totalPages={totalPages} baseUrl="/blog"/>)}
          </div>

          {/* Sidebar sticky */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 space-y-8">
              <PopularPostsWidget />
            </div>
          </aside>
        </div>
      </main>
      
      <CryptoBasicFooter />
    </div>);
}

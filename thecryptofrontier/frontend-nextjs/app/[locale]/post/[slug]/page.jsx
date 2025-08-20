import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import strapiClient from '@/lib/strapiClient';
import { toStrapiLocale } from '@/lib/locale-utils';
import { isValidPostUrl } from '@/lib/locale-validation';
import { notFound } from 'next/navigation';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

// Traduções para breadcrumb e elementos da página
const translations = {
  en: {
    home: "Home",
    posts: "Posts",
    aboutAuthor: "About the author",
    featuredPost: "⭐ Featured Post",
    publishedBy: "By"
  },
  br: {
    home: "Home",
    posts: "Posts", 
    aboutAuthor: "Sobre o autor",
    featuredPost: "⭐ Post em Destaque",
    publishedBy: "Por"
  },
  es: {
    home: "Inicio",
    posts: "Posts",
    aboutAuthor: "Sobre el autor", 
    featuredPost: "⭐ Post Destacado",
    publishedBy: "Por"
  }
};

// Função para buscar o post
async function getPost(slug, locale = 'en') {
    try {
        const strapiLocale = toStrapiLocale(locale);
        console.log('=== POST DATA DEBUG ===');
        console.log('Slug:', slug);
        console.log('Locale:', locale, '-> Strapi Locale:', strapiLocale);
        
        // Validação básica: verifica se a URL é válida para o idioma
        if (!isValidPostUrl(slug, locale)) {
            console.log('Invalid post URL for locale:', locale);
            return null;
        }
        
        // Busca o post com locale específico
        const post = await strapiClient.getPostBySlug(slug, strapiLocale);
        console.log('Post found for locale:', !!post);
        
        // Se encontrou o post, verifica se o locale do post corresponde ao solicitado
        if (post) {
            const postLocale = post.attributes?.locale || post.locale;
            console.log('Post locale:', postLocale);
            
            // Verifica se o locale do post corresponde ao solicitado
            if (postLocale && postLocale !== strapiLocale) {
                console.log('Post locale mismatch! Post:', postLocale, 'Requested:', strapiLocale);
                return null; // Retorna 404 se o locale não corresponder
            }
        }
        
        // Se não encontrou com locale e não é inglês, tenta buscar sem locale para verificar se existe
        if (!post && locale !== 'en') {
            const postWithoutLocale = await strapiClient.getPostBySlug(slug);
            if (postWithoutLocale) {
                console.log('Post exists but not in requested locale, returning 404');
                return null; // Post existe mas não no idioma solicitado
            }
        }
        
        console.log('======================');
        return post;
    }
    catch (error) {
        console.error('Erro ao buscar post:', error);
        return null;
    }
}
// Metadata
export async function generateMetadata({ params }) {
    const { slug, locale } = await params;
    const post = await getPost(slug, locale);
    if (!post) {
        return {
            title: 'Post não encontrado - The Crypto Frontier',
        };
    }
    // Verifica se os dados estão em post.attributes ou diretamente em post
    const data = post.attributes || post;
    const { title, excerpt, seo } = data;
    return {
        title: `${title} - The Crypto Frontier`,
        description: excerpt || (seo === null || seo === void 0 ? void 0 : seo.metaDescription) || 'Artigo sobre criptomoedas',
        openGraph: {
            title: title,
            description: excerpt || 'Artigo sobre criptomoedas',
        },
    };
}
// Static params - por enquanto vamos desabilitar para desenvolvimento
export async function generateStaticParams() {
    return [];
}
// Função para formatar data
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
// Função para renderizar conteúdo
const renderContent = (content) => {
    // Converte markdown básico para HTML
    let html = content;
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mb-2 mt-4">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-3 mt-5">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-4 mt-6">$1</h1>');
    // Bold
    html = html.replace(/\*\*(.+)\*\*/g, '<strong class="font-bold">$1</strong>');
    // Lists
    html = html.replace(/^\d+\. (.+)$/gim, '<li class="ml-4">$1</li>');
    html = html.replace(/^- (.+)$/gim, '<li class="ml-4">$1</li>');
    // Paragraphs
    html = html.split('\n\n').map(para => {
        if (para.trim() && !para.startsWith('<')) {
            return `<p class="mb-4">${para}</p>`;
        }
        return para;
    }).join('\n');
    return (<div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: html }}/>);
};
// Componente principal
export default async function PostPage({ params }) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const { slug, locale } = await params;
    const post = await getPost(slug, locale);
    
    // Obter traduções para o idioma atual
    const t = translations[locale] || translations.en;
    
    if (!post) {
        notFound();
    }
    // Verifica se os dados estão em post.attributes ou diretamente em post
    const data = post.attributes || post;
    const { title, content, excerpt, publishedAt, createdAt, author, featured, tags, categories, featuredImage } = data;
    // Extrai a URL da imagem
    const featuredImageUrl = (featuredImage === null || featuredImage === void 0 ? void 0 : featuredImage.url) || ((_b = (_a = featuredImage === null || featuredImage === void 0 ? void 0 : featuredImage.data) === null || _a === void 0 ? void 0 : _a.attributes) === null || _b === void 0 ? void 0 : _b.url);
    const fullImageUrl = featuredImageUrl
        ? (featuredImageUrl.startsWith('http')
            ? featuredImageUrl
            : `${process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com'}${featuredImageUrl}`)
        : null;
    
    return (
        <div className="min-h-screen bg-white">
            <Header />
            
      {/* Breadcrumb */}
            <div className="border-b border-gray-200 py-3">
                <div className="max-w-4xl mx-auto px-4">
                    <nav className="flex items-center justify-between space-x-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                            <Link href="/" className="hover:text-blue-600 transition-colors">{t.home}</Link>
                            <span className="text-gray-400">›</span>
                            <Link href={`/${locale}/post`} className="hover:text-blue-600 transition-colors">{t.posts}</Link>
                            <span className="text-gray-400">›</span>
                            <span className="text-gray-900 truncate">{title}</span>
                        </div>
                        <LanguageSwitcher />
                    </nav>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-4 py-8">
      <article>
        {/* Título */}
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        
        {/* Meta */}
        <div className="flex items-center gap-4 text-gray-600 mb-6">
                      {author && <span>{t.publishedBy} {typeof author === 'string' ? author : ((_d = (_c = author.data) === null || _c === void 0 ? void 0 : _c.attributes) === null || _d === void 0 ? void 0 : _d.name) || 'Autor'}</span>}
          <span>{formatDate(publishedAt || createdAt)}</span>
        </div>

        {/* Tags e Categorias */}
        {(categories || tags) && (<div className="flex flex-wrap gap-2 mb-6">
            {categories && Array.isArray(categories) && categories.map((cat, index) => (<span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {cat}
              </span>))}
            {tags && Array.isArray(tags) && tags.map((tag, index) => (<span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                #{tag}
              </span>))}
          </div>)}

        {/* Resumo */}
        {excerpt && (<div className="text-lg text-gray-700 mb-8 p-4 bg-gray-50 rounded-lg">
            {excerpt}
          </div>)}

        {/* Imagem em destaque */}
        {fullImageUrl && (<div className="mb-8">
            <Image src={fullImageUrl} alt={title} width={1200} height={675} style={{ width: '100%', height: 'auto' }} className="rounded-lg shadow-lg" priority/>
          </div>)}

        {/* Destaque se for featured */}
        {featured && (<div className="mb-6 p-2 bg-yellow-100 text-yellow-800 rounded text-center">
                        {t.featuredPost}
          </div>)}

        {/* Conteúdo */}
        {content && renderContent(content)}

        {/* Autor */}
        {author && (<div className="mt-12 p-6 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-bold mb-4">{t.aboutAuthor}</h3>
            <div className="flex items-start gap-4">
              <div className="w-[80px] h-[80px] bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {(typeof author === 'string' ? author : ((_f = (_e = author.data) === null || _e === void 0 ? void 0 : _e.attributes) === null || _f === void 0 ? void 0 : _f.name) || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="font-bold">{typeof author === 'string' ? author : ((_h = (_g = author.data) === null || _g === void 0 ? void 0 : _g.attributes) === null || _h === void 0 ? void 0 : _h.name) || 'Autor'}</h4>
              </div>
            </div>
          </div>)}
      </article>
            </main>
            
            <Footer />
        </div>
    );
}

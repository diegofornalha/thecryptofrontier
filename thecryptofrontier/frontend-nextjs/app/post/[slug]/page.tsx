import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import strapiClient from '@/lib/strapiClient';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { slug: string, locale: string };
}

// Função para buscar o post
async function getPost(slug: string, locale: string) {
  try {
    const post = await strapiClient.getPostBySlug(slug, locale);
    console.log('=== POST DATA DEBUG ===');
    console.log('Slug:', slug);
    console.log('Locale:', locale);
    console.log('Post found:', !!post);
    console.log('Post structure:', post);
    console.log('======================');
    return post;
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    return null;
  }
}

// Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const post = await getPost(slug, locale);

  if (!post) {
    return {
      title: 'Post não encontrado - The Crypto Frontier',
    };
  }

  // Verifica se os dados estão em post.attributes ou diretamente em post
  const data = (post as any).attributes || post;
  const { title, excerpt, seo } = data;

  return {
    title: `${title} - The Crypto Frontier`,
    description: excerpt || seo?.metaDescription || 'Artigo sobre criptomoedas',
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
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Função para renderizar conteúdo
const renderContent = (content: string) => {
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
  
  return (
    <div 
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// Componente principal
export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  // Verifica se os dados estão em post.attributes ou diretamente em post
  const data = (post as any).attributes || post;
  const {
    title,
    content,
    excerpt,
    publishedAt,
    createdAt,
    author,
    featured,
    tags,
    categories,
    featuredImage
  } = data;
  
  // Extrai a URL da imagem
  const featuredImageUrl = featuredImage?.url || featuredImage?.data?.attributes?.url;
  const fullImageUrl = featuredImageUrl 
    ? (featuredImageUrl.startsWith('http') 
        ? featuredImageUrl 
        : `${process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com'}${featuredImageUrl}`)
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-blue-600 hover:underline">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/post" className="text-blue-600 hover:underline">Blog</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-600">{title}</span>
      </nav>

      <article>
        {/* Título */}
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        
        {/* Meta */}
        <div className="flex items-center gap-4 text-gray-600 mb-6">
          {author && <span>Por {typeof author === 'string' ? author : author.data?.attributes?.name || 'Autor'}</span>}
          <span>{formatDate(publishedAt || createdAt)}</span>
        </div>

        {/* Tags e Categorias */}
        {(categories || tags) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories && Array.isArray(categories) && categories.map((cat: string, index: number) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {cat}
              </span>
            ))}
            {tags && Array.isArray(tags) && tags.map((tag: string, index: number) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Resumo */}
        {excerpt && (
          <div className="text-lg text-gray-700 mb-8 p-4 bg-gray-50 rounded-lg">
            {excerpt}
          </div>
        )}

        {/* Imagem em destaque */}
        {fullImageUrl && (
          <div className="mb-8">
            <Image
              src={fullImageUrl}
              alt={title}
              width={1200}
              height={675}
              style={{ width: '100%', height: 'auto' }}
              className="rounded-lg shadow-lg"
              priority
            />
          </div>
        )}

        {/* Destaque se for featured */}
        {featured && (
          <div className="mb-6 p-2 bg-yellow-100 text-yellow-800 rounded text-center">
            ⭐ Post em Destaque
          </div>
        )}

        {/* Conteúdo */}
        {content && renderContent(content)}

        {/* Autor */}
        {author && (
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-bold mb-4">Sobre o autor</h3>
            <div className="flex items-start gap-4">
              <div className="w-[80px] h-[80px] bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {(typeof author === 'string' ? author : author.data?.attributes?.name || 'A').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="font-bold">{typeof author === 'string' ? author : author.data?.attributes?.name || 'Autor'}</h4>
              </div>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
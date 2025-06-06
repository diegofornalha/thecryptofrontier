import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '../../../sanity/lib/client';
import { urlForImage } from '../../../sanity/lib/image';
import { PortableText } from '@portabletext/react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CryptoBasicFooter from '@/components/sections/CryptoBasicFooter';
import NewsHeader from '@/components/sections/NewsHeader';
import BreakingNewsTicker from '@/components/sections/home/BreakingNewsTicker';
import PopularPostsWidget from '@/components/widgets/PopularPostsWidget';
import AuthorCard from '@/components/AuthorCard';
import SocialShare from '@/components/SocialShare';
import PostTags from '@/components/PostTags';
import RelatedPosts from '@/components/RelatedPosts';
import { POST_QUERY } from '@/lib/queries';
import './crypto-basic-layout.css';
import '@/css/post-enhancements.css';
import { ReadingProgress } from '@/components/PostEnhancements';
import { TwitterEmbed } from '@/components/TwitterEmbed';


// GROQ para pegar todos os slugs para geração estática
const SLUGS_QUERY = `*[_type == "post" && defined(slug.current)][].slug.current`;

// Interfaces
interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: any;
  content: any[];
  publishedAt: string;
  excerpt?: string;
  author?: { 
    _id: string;
    name?: string;
    image?: any;
    role?: string;
    slug?: { current: string };
    bio?: any[];
  };
  categories?: Array<{
    _id: string;
    title: string;
    slug: { current: string };
    description?: string;
  }>;
  tags?: Array<{
    _id: string;
    title: string;
    slug: { current: string };
  }>;
  seo?: any;
  cryptoMeta?: any;
  originalSource?: string;
}

interface PageProps {
  params: { slug: string };
}

// Função para buscar o post
async function getPost(slug: string): Promise<Post | null> {
  try {
    const post = await client.fetch(POST_QUERY, { slug }, {
      // Cache por 1 hora
      next: { revalidate: 3600 }
    });
    return post || null;
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    return null;
  }
}

// Função para gerar metadata dinâmica
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Post não encontrado - The Crypto Frontier',
      description: 'O post que você está procurando não foi encontrado.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const ogImage = post.mainImage ? urlForImage(post.mainImage).width(1200).height(630).url() : undefined;

  return {
    title: `${post.title} - The Crypto Frontier`,
    description: post.excerpt || post.seo?.metaDescription || 'Artigo sobre criptomoedas e blockchain',
    keywords: post.tags?.map(tag => tag.title).join(', '),
    authors: post.author ? [{ name: post.author.name || 'The Crypto Frontier' }] : undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt || 'Artigo sobre criptomoedas e blockchain',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      images: ogImage ? [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: post.title,
      }] : [],
      locale: 'pt_BR',
      siteName: 'The Crypto Frontier',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || 'Artigo sobre criptomoedas e blockchain',
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://thecryptofrontier.com'}/post/${slug}`,
    },
  };
}

// Função para gerar paths estáticos
export async function generateStaticParams() {
  try {
    const slugs = await client.fetch(SLUGS_QUERY);
    return slugs.map((slug: string) => ({
      slug,
    }));
  } catch (error) {
    console.error('Erro ao buscar slugs:', error);
    return [];
  }
}

// Função para formatar data
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Componentes para PortableText - Estilo Crypto Basic Melhorado
const createCryptoBasicComponents = () => {
  let paragraphCount = 0;
  
  return {
  types: {
    image: ({ value }: any) => {
      if (!value || !value.asset) {
        return null;
      }
      
      const imageUrl = urlForImage(value).url();
      if (!imageUrl) {
        return null;
      }
      
      return (
        <div className="crypto-post-image">
          <Image
            src={imageUrl}
            alt={value.alt || 'Imagem do artigo'}
            width={770}
            height={433}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            className="rounded-lg"
          />
          {value.caption && (
            <p style={{ 
              fontSize: '14px', 
              color: '#666', 
              textAlign: 'center', 
              marginTop: '12px',
              fontStyle: 'italic' 
            }}>
              {value.caption}
            </p>
          )}
        </div>
      );
    },
  },
  block: {
    normal: ({ children }: any) => {
      // Incrementa o contador e verifica se é o primeiro parágrafo
      const currentCount = paragraphCount++;
      const isFirstParagraph = currentCount === 0;
      
      return (
        <p className={`crypto-post-paragraph ${isFirstParagraph ? 'first-paragraph' : ''}`}
           style={isFirstParagraph ? { fontWeight: 600, fontSize: '20px', lineHeight: '1.6', color: '#1a1a1a' } : {}}>
          {children}
        </p>
      );
    },
    h1: ({ children }: any) => <h1 className="crypto-heading-1">{children}</h1>,
    h2: ({ children }: any) => <h2 className="crypto-heading-2">{children}</h2>,
    h3: ({ children }: any) => <h3 className="crypto-heading-3">{children}</h3>,
    blockquote: ({ children }: any) => (
      <blockquote className="crypto-blockquote">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: any) => {
      const url = value.href;
      
      // Detecta links do Twitter/X
      if (url && (url.includes('twitter.com/') || url.includes('x.com/')) && url.includes('/status/')) {
        return <TwitterEmbed url={url} />;
      }
      
      // Links normais
      return (
        <a href={url} className="crypto-link" target="_blank" rel="noopener">
          {children}
        </a>
      );
    },
    internalLink: ({ children, value }: any) => (
      <Link href={`/post/${value.slug}`} className="crypto-link">
        {children}
      </Link>
    ),
    strong: ({ children }: any) => <strong className="font-bold text-gray-900">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => <code className="crypto-inline-code">{children}</code>,
  },
  list: {
    bullet: ({ children }: any) => <ul className="crypto-list crypto-list-bullet">{children}</ul>,
    number: ({ children }: any) => <ol className="crypto-list crypto-list-number">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => <li className="crypto-list-item">{children}</li>,
    number: ({ children }: any) => <li className="crypto-list-item">{children}</li>,
  },
  };
};

// Componentes para PortableText - Original (mantido para referência)
const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      // Validar se há uma imagem válida
      if (!value || !value.asset) {
        return null;
      }
      
      const imageUrl = urlForImage(value).url();
      if (!imageUrl) {
        return null;
      }
      
      return (
        <div className="my-8 flex flex-col items-center">
          <Image
            src={imageUrl}
            alt={value.alt || 'Imagem do artigo'}
            width={800}
            height={800}
            className="rounded-lg object-contain max-w-full h-auto"
          />
          {value.caption && (
            <p className="text-sm text-muted-foreground mt-2 text-center italic">
              {value.caption}
            </p>
          )}
        </div>
      );
    },
  },
  block: {
    normal: ({ children }: any) => <p className="mb-4 leading-relaxed">{children}</p>,
    h1: ({ children }: any) => <h1 className="text-3xl font-bold mb-6 mt-8">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl font-bold mb-4 mt-6">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-bold mb-3 mt-5">{children}</h3>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-6 text-muted-foreground">
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: any) => (
      <a href={value.href} className="text-primary hover:underline" target="_blank" rel="noopener">
        {children}
      </a>
    ),
    internalLink: ({ children, value }: any) => (
      <Link href={`/post/${value.slug}`} className="text-primary hover:underline">
        {children}
      </Link>
    ),
  },
  list: {
    bullet: ({ children }: any) => <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>,
    number: ({ children }: any) => <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
  },
};

// Componente da página do post
export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  // Links de navegação
  const navLinks: any = [
    { label: "Home", url: "/" },
    { label: "Buscar", url: "/buscas" },
    { label: "Blog", url: "/blog" },
    { label: "Studio", url: "/studio" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <NewsHeader />
      <ReadingProgress />
      
      {/* Layout padrão The Crypto Basic */}
      <div className="pt-[70px]">
        {/* Breaking News Ticker */}
        <BreakingNewsTicker />
        
        <div className="crypto-container" style={{ marginTop: '30px' }}>
        <div className="crypto-content-wrapper">
          <article className="crypto-main-content">
            {/* Breadcrumb */}
            <nav className="crypto-breadcrumb">
              <Link href="/">Home</Link>
              <span style={{ margin: '0 8px', color: '#999' }}>›</span>
              <Link href="/blog">Crypto News</Link>
              <span style={{ margin: '0 8px', color: '#999' }}>›</span>
              <span>{post.title}</span>
            </nav>

            {/* Header do post */}
            <header className="crypto-post-header">
              {/* Título */}
              <h1 className="crypto-post-title">{post.title}</h1>

              {/* Meta informações */}
              <div className="crypto-post-meta">
                <span style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                  ESCRITO POR: {post.author?.name ? (
                    <strong style={{ color: '#4db2ec' }}>{post.author.name.toUpperCase()}</strong>
                  ) : 'ADMIN'}
                </span>
                <span style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
                  DATA: <strong>{formatDate(post.publishedAt).toUpperCase()}</strong>
                </span>
              </div>
            </header>

            {/* Imagem principal */}
            {post.mainImage && post.mainImage.asset && (
              <div className="crypto-post-image">
                <Image
                  src={urlForImage(post.mainImage).url()}
                  alt={post.mainImage.alt || post.title}
                  width={770}
                  height={433}
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    display: 'block',
                    backgroundColor: '#f0f0f0' // Cinza claro como placeholder
                  }}
                  priority
                  placeholder="empty"
                />
                {post.mainImage.caption && (
                  <p style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    textAlign: 'center', 
                    marginTop: '10px',
                    fontStyle: 'italic' 
                  }}>
                    {post.mainImage.caption}
                  </p>
                )}
              </div>
            )}

            {/* Social Share */}
            <div className="my-6 pb-6 border-b border-gray-200">
              <SocialShare 
                url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://thecryptofrontier.com'}/post/${post.slug.current}`}
                title={post.title}
              />
            </div>

            {/* Conteúdo do post */}
            <div className="crypto-post-content">
              {post.content && (
                <PortableText value={post.content} components={createCryptoBasicComponents()} />
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <PostTags tags={post.tags} className="mt-6 mb-8" />
            )}

            {/* Author Card */}
            {post.author && (
              <div className="mt-8">
                <AuthorCard author={post.author} />
              </div>
            )}

            {/* Related Posts */}
            <RelatedPosts 
              currentPostId={post._id}
              categories={post.categories?.map(cat => cat._id) || []}
            />

          </article>

          {/* Sidebar */}
          <aside className="crypto-sidebar space-y-8">
            <PopularPostsWidget />
          </aside>
        </div>
        </div>
      </div>

      <CryptoBasicFooter />
    </div>
  );
}
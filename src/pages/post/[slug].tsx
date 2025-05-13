import React from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '../../sanity/lib/client';
import { urlForImage } from '../../sanity/lib/image';
import { PortableText } from '@portabletext/react';
import { ParsedUrlQuery } from 'querystring';
import ModernFooter from '../../components/sections/ModernFooter';
import ModernHeader from '../../components/sections/ModernHeader';
import { getFooterConfig } from '../../lib/getFooterConfig';
import { getHeaderConfig } from '../../lib/getHeaderConfig';

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// GROQ para pegar todos os slugs para geração estática
const SLUGS_QUERY = `*[_type == "post" && defined(slug.current)][].slug.current`;

// GROQ atualizado para o novo schema
const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  mainImage{
    asset->{
      _id,
      url
    },
    caption,
    alt,
    attribution
  },
  body[]{
    ...,
    markDefs[]{
      ...,
      _type == "internalLink" => {
        "slug": @.reference->slug.current
      }
    }
  },
  content,
  publishedAt,
  excerpt,
  author->{
    _id,
    name,
    image{asset->{_id, url}},
    role,
    slug,
    bio,
  },
  categories[]->{
    _id,
    title,
    slug,
    description
  },
  tags[]->{
    _id,
    title,
    slug
  },
  seo,
  cryptoMeta,
  originalSource
}`;

// Consulta para buscar a configuração do blog
const BLOG_CONFIG_QUERY = `*[_type == "blogConfig"][0]{
  hideAuthorOnPosts,
  hideDateOnPosts
}`;

// Interfaces atualizadas
interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: any; // Usar any para evitar problemas com o tipo de imagem do Sanity
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
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    openGraphImage?: any;
    keywords?: string[];
    canonicalUrl?: string;
  };
  cryptoMeta?: {
    coinName?: string;
    coinSymbol?: string;
    coinLogo?: any;
    currentPrice?: number;
    priceChange24h?: number;
    marketCap?: number;
    coingeckoId?: string;
    links?: Array<{
      title: string;
      url: string;
    }>;
  };
  originalSource?: {
    url?: string;
    title?: string;
    site?: string;
  };
}

interface PostProps {
  post: Post;
  footerConfig: any;
  headerConfig: any;
}

interface IParams extends ParsedUrlQuery {
  slug: string;
}

// Componentes para o PortableText
const components = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <div className="my-8 relative w-full h-96">
          <Image
            src={urlForImage(value).url()}
            alt={value.alt || ''}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain"
          />
          {value.caption && (
            <p className="text-sm text-center text-muted-foreground mt-2">{value.caption}</p>
          )}
        </div>
      );
    },
    code: ({ value }: any) => {
      return (
        <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm my-4">
          <code>{value.code}</code>
        </pre>
      );
    },
  },
  block: {
    h1: ({ children }: any) => <h1 className="text-3xl font-bold mt-12 mb-4">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl font-bold mt-10 mb-4">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-bold mt-8 mb-4">{children}</h3>,
    h4: ({ children }: any) => <h4 className="text-lg font-bold mt-6 mb-4">{children}</h4>,
    normal: ({ children }: any) => <p className="text-foreground mb-4 leading-relaxed">{children}</p>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary pl-4 italic my-6">{children}</blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: any) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
      return (
        <a 
          href={value.href} 
          rel={rel} 
          className="text-primary hover:underline"
          target={!value.href.startsWith('/') ? '_blank' : undefined}
        >
          {children}
        </a>
      );
    },
    strong: ({ children }: any) => <strong className="font-bold">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
    code: ({ children }: any) => (
      <code className="bg-muted px-2 py-1 rounded font-mono text-sm">{children}</code>
    ),
    underline: ({ children }: any) => <span className="underline">{children}</span>,
    'strike-through': ({ children }: any) => <span className="line-through">{children}</span>,
  },
  list: {
    bullet: ({ children }: any) => <ul className="list-disc ml-6 my-4 space-y-1">{children}</ul>,
    number: ({ children }: any) => <ol className="list-decimal ml-6 my-4 space-y-1">{children}</ol>,
  },
  listItem: {
    bullet: ({ children }: any) => <li className="text-foreground">{children}</li>,
    number: ({ children }: any) => <li className="text-foreground">{children}</li>,
  },
};

// Formatação de data
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

// Função para formatar preço em BRL
const formatPrice = (price?: number) => {
  if (!price) return '';
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(price);
};

// Componente de página do blog
export default function Post({ post, footerConfig, headerConfig, blogConfig }: PostProps & { blogConfig?: { hideAuthorOnPosts?: boolean, hideDateOnPosts?: boolean } }) {
  // Obter os links de navegação do Sanity ou usar fallback
  const navLinks = footerConfig?.navLinks?.length > 0 
    ? footerConfig.navLinks 
    : [
        { label: "Home", url: "/" },
        { label: "Blog", url: "/blog" },
        { label: "Studio", url: "/studio-redirect" }
      ];

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post não encontrado</h1>
          <Button asChild>
            <Link href="/blog">Voltar para o blog</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Verifica se o corpo do post está vazio e providencia um conteúdo padrão
  const hasContent = post.content && post.content.length > 0;

  // Usar dados de SEO
  const metaTitle = post.seo?.metaTitle || post.title;
  const metaDescription = post.seo?.metaDescription || post.excerpt || post.title;
  const ogImage = post.seo?.openGraphImage 
    ? urlForImage(post.seo.openGraphImage).url() 
    : (post.mainImage ? urlForImage(post.mainImage).url() : undefined);

  // Controle de exibição de autor e data
  const showAuthor = !blogConfig?.hideAuthorOnPosts && post.author !== undefined;
  const showDate = !blogConfig?.hideDateOnPosts && post.publishedAt;

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription || ""} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Open Graph tags */}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription || ""} />
        <meta property="og:type" content="article" />
        {ogImage && <meta property="og:image" content={ogImage} />}
        
        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription || ""} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
      </Head>
      
      <ModernHeader 
        title={headerConfig?.title || "The Crypto Frontier"} 
        navLinks={headerConfig?.navLinks || navLinks} 
      />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/blog">
            ← Voltar para o blog
          </Link>
        </Button>
        
        <Card className="p-8">
          <article>
            <header className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories && post.categories.map((category) => (
                  <Badge 
                    key={category._id} 
                    variant="secondary"
                  >
                    {category.title}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-4xl font-bold text-foreground mb-4">{post.title}</h1>
              
              {post.excerpt && (
                <p className="text-lg text-muted-foreground mb-4">{post.excerpt}</p>
              )}
              
              <div className="flex items-center mb-6">
                {showAuthor && post.author && (
                  <Avatar className="mr-4 h-12 w-12">
                    {post.author.image ? (
                      <AvatarImage 
                        src={urlForImage(post.author.image).url()} 
                        alt={post.author.name || 'Autor'} 
                      />
                    ) : null}
                    <AvatarFallback>{post.author.name ? post.author.name.substring(0, 2).toUpperCase() : 'CF'}</AvatarFallback>
                  </Avatar>
                )}
                
                <div>
                  {showAuthor && post.author && (
                    <div className="font-medium">{post.author.name || 'Autor'}</div>
                  )}
                  {((showAuthor && post.author?.role) || showDate) && (
                    <div className="text-sm text-muted-foreground">
                      {showAuthor && post.author?.role && (
                        <span className="mr-2">{post.author.role}</span>
                      )}
                      {showDate && (
                        <time dateTime={post.publishedAt}>
                          {formatDate(post.publishedAt)}
                        </time>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {post.cryptoMeta && post.cryptoMeta.coinName && (
                <div className="bg-muted p-4 rounded-lg mb-6">
                  <h2 className="text-lg font-medium mb-2">Informações de {post.cryptoMeta.coinName}</h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Símbolo</p>
                      <p className="font-medium">{post.cryptoMeta.coinSymbol}</p>
                    </div>
                    {post.cryptoMeta.currentPrice !== undefined && (
                      <div>
                        <p className="text-sm text-muted-foreground">Preço</p>
                        <p className="font-medium">{formatPrice(post.cryptoMeta.currentPrice)}</p>
                      </div>
                    )}
                    {post.cryptoMeta.priceChange24h !== undefined && (
                      <div>
                        <p className="text-sm text-muted-foreground">Variação 24h</p>
                        <p className={`font-medium ${post.cryptoMeta.priceChange24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {post.cryptoMeta.priceChange24h > 0 ? '+' : ''}{post.cryptoMeta.priceChange24h.toFixed(2)}%
                        </p>
                      </div>
                    )}
                    {post.cryptoMeta.marketCap && (
                      <div>
                        <p className="text-sm text-muted-foreground">Market Cap</p>
                        <p className="font-medium">{formatPrice(post.cryptoMeta.marketCap)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </header>
            
            {post.mainImage && (
              <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
                <Image
                  src={urlForImage(post.mainImage).url()}
                  alt={(post.mainImage.alt as string) || post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                />
                {post.mainImage.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 text-sm">
                    {post.mainImage.caption}
                    {post.mainImage.attribution && (
                      <span className="ml-1 text-gray-300">
                        (Crédito: {post.mainImage.attribution})
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {hasContent ? (
                <PortableText value={post.content} components={components} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">O conteúdo deste post ainda está sendo elaborado.</p>
                  <p className="text-muted-foreground">Volte em breve para ler o artigo completo.</p>
                </div>
              )}
            </div>
            
            {post.originalSource && post.originalSource.url && (
              <div className="mt-8 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Fonte original: {' '}
                  <a 
                    href={post.originalSource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {post.originalSource.title || post.originalSource.site || post.originalSource.url}
                  </a>
                </p>
              </div>
            )}
            
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Badge key={tag._id} variant="outline">
                    #{tag.title}
                  </Badge>
                ))}
              </div>
            )}
          </article>
        </Card>
      </main>
      
      <ModernFooter 
        title={footerConfig?.title || "The Crypto Frontier"}
        description={footerConfig?.description || "Seu portal de conteúdo sobre criptomoedas e blockchain"}
        socialLinks={footerConfig?.socialLinks || [
          { label: 'Twitter', icon: 'twitter', url: 'https://twitter.com/' },
          { label: 'Facebook', icon: 'facebook', url: 'https://facebook.com/' },
          { label: 'Instagram', icon: 'instagram', url: 'https://instagram.com/' }
        ]}
        primaryLinks={{
          title: "Navegação",
          links: headerConfig?.navLinks || [
            { label: "Home", url: "/" },
            { label: "Blog", url: "/blog" },
            { label: "Studio", url: "/studio-redirect" }
          ]
        }}
        secondaryLinks={{
          title: "Recursos",
          links: footerConfig?.secondaryLinks || [
            { label: "Artigos", url: "/blog" },
            { label: "Tutoriais", url: "/blog" }
          ]
        }}
        legalLinks={footerConfig?.legalLinks || [
          { label: "Termos de Uso", url: "#" },
          { label: "Política de Privacidade", url: "#" }
        ]}
        copyrightText={footerConfig?.copyrightText || `© ${new Date().getFullYear()} The Crypto Frontier. Todos os direitos reservados.`}
      />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await client.fetch(SLUGS_QUERY);
  
  // Adicionando o slug com a palavra "bitcoin" no final que está na URL
  const additionalPaths = ['a-b3-do-brasil-lancara-futuros-de-ethereum-e-solana-reduz-tamanho-do-contrato-de-bitcoin'];
  
  // Combinando os slugs existentes com o adicional
  const allSlugs = [...slugs, ...additionalPaths];
  
  return {
    paths: allSlugs.map((slug: string) => ({ params: { slug } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  if (!params) return { notFound: true };
  const { slug } = params as IParams;

  try {
    const [post, blogConfig, footerConfig, headerConfig] = await Promise.all([
      client.fetch(POST_QUERY, { slug }),
      client.fetch(BLOG_CONFIG_QUERY),
      getFooterConfig(),
      getHeaderConfig(),
    ]);
    
    if (!post) {
      return { notFound: true };
    }

    return {
      props: {
        post,
        blogConfig,
        footerConfig,
        headerConfig,
      },
      revalidate: 3600, // Revalidar a cada 1 hora
    };
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return { notFound: true };
  }
}; 
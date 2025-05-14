import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '../sanity/lib/client';
import { urlForImage } from '../sanity/lib/image';
import Head from 'next/head';
import ModernFooter from '../components/sections/ModernFooter';
import ModernHeader from '../components/sections/ModernHeader';
import { getFooterConfig } from '../lib/getFooterConfig';
import { getHeaderConfig } from '../lib/getHeaderConfig';

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Consulta GROQ atualizada para o novo schema
const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  mainImage {
    ...,
    "alt": alt
  },
  publishedAt,
  excerpt,
  "author": author->{
    name,
    image,
    role
  },
  "categories": categories[]->{ 
    _id,
    title,
    slug
  },
  "tags": tags[]->{ 
    _id,
    title,
    slug
  },
  "cryptoData": cryptoMeta {
    coinName,
    coinSymbol,
    currentPrice,
    priceChange24h
  },
  "estimatedReadingTime": round(length(pt::text(content)) / 5 / 180)
}`;

// Consulta para buscar a configuração do blog
const BLOG_CONFIG_QUERY = `*[_type == "blogConfig"][0]{
  hideAuthorOnPosts,
  hideDateOnPosts
}`;

// Interface atualizada para os posts
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

// Propriedades da página
interface BlogProps {
  posts: Post[];
  blogConfig?: {
    hideAuthorOnPosts?: boolean;
    hideDateOnPosts?: boolean;
  };
  footerConfig: any;
  headerConfig: any;
}

// Importar utilitário de data
import { formatDate } from '../utils/date-utils';

// Função para formatar o preço em BRL
const formatPrice = (price?: number) => {
  if (!price) return '';
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(price);
};

// Componente de página do blog
export default function Blog({ posts, blogConfig, footerConfig, headerConfig }: BlogProps) {
  // Obter os links de navegação do Sanity ou usar fallback
  const navLinks = footerConfig?.navLinks?.length > 0 
    ? footerConfig.navLinks 
    : [
        { label: "Home", url: "/" },
        { label: "Blog", url: "/blog" },
        { label: "Studio", url: "/studio-redirect" }
      ];

  // Controle de exibição de autor e data
  const showAuthor = !blogConfig?.hideAuthorOnPosts;
  const showDate = !blogConfig?.hideDateOnPosts;

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>{"Blog - The Crypto Frontier"}</title>
        <meta name="description" content="Artigos sobre criptomoedas, blockchain e tecnologia" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <ModernHeader 
        title={headerConfig?.title || "The Crypto Frontier"} 
        navLinks={headerConfig?.navLinks || navLinks} 
      />
      
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold mb-4">Blog</h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Artigos, tutoriais e notícias sobre o mundo das criptomoedas e blockchain
            </p>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Card key={post._id} className="overflow-hidden flex flex-col h-full">
              {post.mainImage && post.mainImage.asset && (
                <div className="relative h-48">
                  <Image
                    src={urlForImage(post.mainImage).url()}
                    alt={post.mainImage.alt || post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
              <CardHeader className="flex-grow">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.categories && post.categories.map((category) => (
                    <Badge key={category._id} variant="secondary">
                      {category.title}
                    </Badge>
                  ))}
                </div>
                <h2 className="text-xl font-bold mb-3 text-foreground">
                  <Link href={`/post/${post.slug.current}`} className="hover:text-primary">
                    {post.title}
                  </Link>
                </h2>
                {post.excerpt && (
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                <div className="text-sm text-muted-foreground">
                  {showAuthor && post.author?.name && <span>{post.author.name}{showDate && post.publishedAt ? ' • ' : ''}</span>}
                  {showDate && post.publishedAt && 
                    <time dateTime={post.publishedAt} suppressHydrationWarning>{formatDate(post.publishedAt)}</time>
                  }
                  {post.estimatedReadingTime && (
                    <span> • {post.estimatedReadingTime} min de leitura</span>
                  )}
                </div>
                {post.cryptoData?.coinName && (
                  <div className="mt-2 flex items-center text-sm">
                    <span className="font-medium">{post.cryptoData.coinName} ({post.cryptoData.coinSymbol}): </span>
                    <span className="ml-1">{formatPrice(post.cryptoData.currentPrice)}</span>
                    {post.cryptoData.priceChange24h && (
                      <span className={`ml-2 ${post.cryptoData.priceChange24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {post.cryptoData.priceChange24h > 0 ? '+' : ''}{post.cryptoData.priceChange24h.toFixed(2)}%
                      </span>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardFooter className="pt-0">
                <div className="flex justify-between items-center w-full">
                  <Button asChild variant="link" className="p-0">
                    <Link href={`/post/${post.slug.current}`}>
                      Ler mais →
                    </Link>
                  </Button>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex gap-1">
                      {post.tags.slice(0, 2).map(tag => (
                        <Badge key={tag._id} variant="outline" className="text-xs">
                          {tag.title}
                        </Badge>
                      ))}
                      {post.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {posts.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Nenhum post encontrado</h2>
            <p className="text-muted-foreground">Em breve teremos novos artigos.</p>
          </div>
        )}
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
          links: navLinks
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

// Buscar dados no momento da compilação
export async function getStaticProps() {
  try {
    const [posts, blogConfig, footerConfig, headerConfig] = await Promise.all([
      client.fetch(POSTS_QUERY),
      client.fetch(BLOG_CONFIG_QUERY),
      getFooterConfig(),
      getHeaderConfig(),
    ]);
    
    return {
      props: {
        posts,
        blogConfig,
        footerConfig,
        headerConfig,
      },
      // Revalidar a cada 1 hora
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return {
      props: {
        posts: [],
        blogConfig: {},
        footerConfig: {},
        headerConfig: {},
      },
      revalidate: 60,
    };
  }
} 
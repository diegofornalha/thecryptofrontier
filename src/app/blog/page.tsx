import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '../../sanity/lib/client';
import { urlForImage } from '../../sanity/lib/image';
import ModernFooter from '../../components/sections/ModernFooter';
import ModernHeader from '../../components/sections/ModernHeader';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - The Crypto Frontier',
  description: 'Artigos, tutoriais e notícias sobre o mundo das criptomoedas e blockchain. Fique atualizado com as últimas tendências do mercado cripto.',
};

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

// Função para buscar os posts
async function getPosts(): Promise<Post[]> {
  try {
    const posts = await client.fetch(POSTS_QUERY);
    return posts || [];
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return [];
  }
}

// Componente da página do blog (Server Component)
export default async function BlogPage() {
  const posts = await getPosts();
  
  // Links de navegação
  const navLinks = [
    { label: "Home", url: "/" },
    { label: "Buscar", url: "/buscas" },
    { label: "Blog", url: "/blog" },
    { label: "Studio", url: "/studio" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ModernHeader 
        title="The Crypto Frontier" 
        navLinks={navLinks} 
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
        {posts.length > 0 ? (
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
                    {post.author?.name && <span>{post.author.name}</span>}
                    {post.publishedAt && (
                      <>
                        {post.author?.name && ' • '}
                        <time dateTime={post.publishedAt}>
                          {formatDate(post.publishedAt)}
                        </time>
                      </>
                    )}
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
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Nenhum post encontrado</h2>
            <p className="text-muted-foreground mb-8">Em breve teremos novos artigos.</p>
            <Button asChild>
              <Link href="/buscas">
                🔍 Fazer uma busca
              </Link>
            </Button>
          </div>
        )}
      </main>
      
      <ModernFooter 
        title="The Crypto Frontier"
        description="Seu portal de conteúdo sobre criptomoedas e blockchain"
        socialLinks={[
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
          links: [
            { label: "Buscar", url: "/buscas" },
            { label: "Artigos", url: "/blog" },
            { label: "Tutoriais", url: "/blog" }
          ]
        }}
        legalLinks={[
          { label: "Termos de Uso", url: "#" },
          { label: "Política de Privacidade", url: "#" }
        ]}
        copyrightText={`© ${new Date().getFullYear()} The Crypto Frontier. Todos os direitos reservados.`}
      />
    </div>
  );
}
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { client } from '../sanity/lib/client';
import { urlForImage } from '../sanity/lib/image';
import Head from 'next/head';

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Consulta GROQ para buscar os posts do blog
const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  mainImage,
  publishedAt,
  "authorName": author->name,
  categories,
  "estimatedReadingTime": round(length(pt::text(body)) / 5 / 180)
}`;

// Interface para os posts
interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: any;
  publishedAt: string;
  authorName?: string;
  categories?: string[];
  estimatedReadingTime?: number;
}

// Propriedades da página
interface BlogProps {
  posts: Post[];
}

// Função para formatar a data
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

// Componente de página do blog
export default function Blog({ posts }: BlogProps) {
  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>{"Blog - The Crypto Frontier"}</title>
        <meta name="description" content="Artigos sobre criptomoedas, blockchain e tecnologia" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold mb-4">Blog</h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Artigos, tutoriais e notícias sobre o mundo das criptomoedas e blockchain
            </p>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Card key={post._id} className="overflow-hidden flex flex-col h-full">
              {post.mainImage && (
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
                  {post.categories && post.categories.map((category, index) => (
                    <Badge key={index} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
                <h2 className="text-xl font-bold mb-3 text-foreground">
                  <Link href={`/post/${post.slug.current}`} className="hover:text-primary">
                    {post.title}
                  </Link>
                </h2>
                <div className="text-sm text-muted-foreground">
                  {post.authorName && <span>{post.authorName} • </span>}
                  <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  {post.estimatedReadingTime && (
                    <span> • {post.estimatedReadingTime} min de leitura</span>
                  )}
                </div>
              </CardHeader>
              <CardFooter>
                <Button asChild variant="link" className="p-0">
                  <Link href={`/post/${post.slug.current}`}>
                    Ler mais →
                  </Link>
                </Button>
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
      
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} The Crypto Frontier. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

// Buscar dados no momento da compilação
export async function getStaticProps() {
  try {
    const posts = await client.fetch(POSTS_QUERY);
    
    return {
      props: {
        posts,
      },
      // Revalidar a cada 1 hora
      revalidate: 3600,
    };
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    return {
      props: {
        posts: [],
      },
      revalidate: 60,
    };
  }
} 
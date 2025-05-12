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

// GROQ para pegar um post específico pelo slug
const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  mainImage,
  body,
  publishedAt,
  "author": author->{name, image, bio},
  categories
}`;

// Interfaces
interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: any;
  body: any;
  publishedAt: string;
  author?: { 
    name?: string;
    image?: any;
    bio?: string;
  };
  categories?: string[];
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
        </div>
      );
    },
  },
  block: {
    h1: ({ children }: any) => <h1 className="text-3xl font-bold mt-12 mb-4">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl font-bold mt-10 mb-4">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-bold mt-8 mb-4">{children}</h3>,
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

// Componente de página do blog
export default function Post({ post, footerConfig, headerConfig }: PostProps) {
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

  const getInitials = (name: string) => {
    return name
      ? name
          .split(' ')
          .map((part) => part[0])
          .join('')
          .toUpperCase()
          .substring(0, 2)
      : 'CF';
  };

  // Verifica se o corpo do post está vazio e providencia um conteúdo padrão
  const hasContent = post.body && post.body.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>{`${post.title} - The Crypto Frontier`}</title>
        <meta name="description" content={post.title} />
        <meta property="og:title" content={post.title} />
        <meta property="og:type" content="article" />
        {post.mainImage && (
          <meta property="og:image" content={urlForImage(post.mainImage).url()} />
        )}
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
                {post.categories && post.categories.map((category, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
              
              <h1 className="text-4xl font-bold text-foreground mb-4">{post.title}</h1>
              
              <div className="flex items-center mb-6">
                {post.author && (
                  <Avatar className="mr-4 h-12 w-12">
                    {post.author.image ? (
                      <AvatarImage 
                        src={urlForImage(post.author.image).url()} 
                        alt={post.author.name || 'Autor'} 
                      />
                    ) : null}
                    <AvatarFallback>{getInitials(post.author.name || 'Crypto Frontier')}</AvatarFallback>
                  </Avatar>
                )}
                
                <div>
                  <div className="font-medium">{post.author?.name || 'Autor'}</div>
                  <div className="text-sm text-muted-foreground">
                    <time dateTime={post.publishedAt}>
                      {formatDate(post.publishedAt)}
                    </time>
                  </div>
                </div>
              </div>
            </header>
            
            {post.mainImage && (
              <div className="relative h-96 mb-8 rounded-lg overflow-hidden">
                <Image
                  src={urlForImage(post.mainImage).url()}
                  alt={post.mainImage.alt || post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                />
              </div>
            )}
            
            <div className="prose prose-lg max-w-none dark:prose-invert">
              {hasContent ? (
                <PortableText value={post.body} components={components} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">O conteúdo deste post ainda está sendo elaborado.</p>
                  <p className="text-muted-foreground">Volte em breve para ler o artigo completo.</p>
                </div>
              )}
            </div>
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
    const post = await client.fetch(POST_QUERY, { slug });
    
    if (!post) {
      return { notFound: true };
    }

    const [footerConfig, headerConfig] = await Promise.all([
      getFooterConfig(),
      getHeaderConfig(),
    ]);

    return {
      props: {
        post,
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
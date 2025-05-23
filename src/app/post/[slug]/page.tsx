import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '../../../sanity/lib/client';
import { urlForImage } from '../../../sanity/lib/image';
import { PortableText } from '@portabletext/react';
import ModernFooter from '../../../components/sections/ModernFooter';
import ModernHeader from '../../../components/sections/ModernHeader';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

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
    const post = await client.fetch(POST_QUERY, { slug });
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
    };
  }

  return {
    title: `${post.title} - The Crypto Frontier`,
    description: post.excerpt || post.seo?.metaDescription || 'Artigo sobre criptomoedas e blockchain',
    openGraph: {
      title: post.title,
      description: post.excerpt || 'Artigo sobre criptomoedas e blockchain',
      images: post.mainImage ? [urlForImage(post.mainImage).url()] : [],
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

// Componentes para PortableText
const portableTextComponents = {
  types: {
    image: ({ value }: any) => (
      <div className="my-8">
        <Image
          src={urlForImage(value).url()}
          alt={value.alt || 'Imagem do artigo'}
          width={800}
          height={400}
          className="rounded-lg object-cover w-full"
        />
        {value.caption && (
          <p className="text-sm text-muted-foreground mt-2 text-center italic">
            {value.caption}
          </p>
        )}
      </div>
    ),
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
      
      <article className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-primary">Blog</Link>
            <span>/</span>
            <span className="text-foreground">{post.title}</span>
          </div>
        </nav>

        {/* Header do post */}
        <header className="mb-8">
          {/* Categorias */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((category) => (
                <Badge key={category._id} variant="secondary">
                  {category.title}
                </Badge>
              ))}
            </div>
          )}

          {/* Título */}
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Meta informações */}
          <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-muted-foreground">
            {post.author && (
              <div className="flex items-center gap-2">
                {post.author.image && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={urlForImage(post.author.image).url()} alt={post.author.name} />
                    <AvatarFallback>{post.author.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
                <span>{post.author.name}</span>
              </div>
            )}
            <span>•</span>
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          </div>

          {/* Imagem principal */}
          {post.mainImage && (
            <div className="mb-8">
              <Image
                src={urlForImage(post.mainImage).url()}
                alt={post.mainImage.alt || post.title}
                width={1200}
                height={600}
                className="rounded-lg object-cover w-full"
                priority
              />
              {post.mainImage.caption && (
                <p className="text-sm text-muted-foreground mt-2 text-center italic">
                  {post.mainImage.caption}
                </p>
              )}
            </div>
          )}
        </header>

        {/* Conteúdo do post */}
        <div className="prose prose-lg max-w-none">
          {post.content && (
            <PortableText value={post.content} components={portableTextComponents} />
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-lg font-semibold mb-4">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag._id} variant="outline">
                  {tag.title}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Navegação */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex justify-between">
            <Button asChild variant="outline">
              <Link href="/blog">← Voltar ao Blog</Link>
            </Button>
            <Button asChild>
              <Link href="/buscas">🔍 Buscar mais artigos</Link>
            </Button>
          </div>
        </div>
      </article>
      
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
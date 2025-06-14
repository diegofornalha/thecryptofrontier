import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { client } from '../../../strapi/lib/client';
import { urlForImage } from "@/lib/imageHelper"
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

// Interface que reflete nossa query atual
interface PostData {
  _id: string;
  title: string;
  slug: string;
  mainImage?: {
    asset: any;
    alt?: string;
    caption?: string;
  };
  content: any[];
  publishedAt: string;
  excerpt?: string;
  author?: {
    _id: string;
    name: string;
    image?: any;
    role?: string;
    slug: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

interface PageProps {
  params: { slug: string };
}

// Função para buscar o post
async function getPost(slug: string): Promise<PostData | null> {
  try {
    const post = await client.fetch(POST_QUERY, { slug });
    console.log('=== POST DATA DEBUG ===');
    console.log('Slug:', slug);
    console.log('Post found:', !!post);
    console.log('Post mainImage:', post?.mainImage);
    console.log('Post mainImage asset:', post?.mainImage?.asset);
    console.log('======================');
    return post || null;
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    return null;
  }
}

// Componentes do PortableText
const portableTextComponents = {
  types: {
    image: ({ value }: any) => {
      if (!value?.asset) return null;
      
      const imageBuilder = urlForImage(value);
      if (!imageBuilder) return null;
      
      const imageUrl = imageBuilder.width(800).url();
      
      return (
        <div className="my-6">
          <Image
            src={imageUrl}
            alt={value.alt || 'Imagem do post'}
            width={800}
            height={450}
            style={{ width: '100%', height: 'auto' }}
            className="rounded-lg"
          />
          {value.caption && (
            <p className="text-sm text-gray-600 text-center mt-2 italic">
              {value.caption}
            </p>
          )}
        </div>
      );
    },
  },
  block: {
    normal: ({ children }: any) => <p className="mb-4">{children}</p>,
    h1: ({ children }: any) => <h1 className="text-3xl font-bold mb-4 mt-6">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-2xl font-bold mb-3 mt-5">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-xl font-bold mb-2 mt-4">{children}</h3>,
  },
  marks: {
    link: ({ children, value }: any) => (
      <a 
        href={value.href} 
        className="text-blue-600 hover:underline" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    strong: ({ children }: any) => <strong className="font-bold">{children}</strong>,
    em: ({ children }: any) => <em className="italic">{children}</em>,
  },
};

// Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Post não encontrado - The Crypto Frontier',
    };
  }

  let ogImage: string | undefined;
  if (post.mainImage?.asset) {
    const imageBuilder = urlForImage(post.mainImage as any);
    if (imageBuilder) {
      ogImage = imageBuilder.width(1200).height(630).url();
    }
  }

  return {
    title: `${post.title} - The Crypto Frontier`,
    description: post.excerpt || post.seo?.metaDescription || 'Artigo sobre criptomoedas',
    openGraph: {
      title: post.title,
      description: post.excerpt || 'Artigo sobre criptomoedas',
      images: ogImage ? [{ url: ogImage }] : [],
    },
  };
}

// Static params
export async function generateStaticParams() {
  try {
    const slugs = await client.fetch(SLUGS_QUERY);
    return slugs.map((slug: string) => ({ slug }));
  } catch (error) {
    return [];
  }
}

// Componente principal
export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

     // URL da imagem principal
   let mainImageUrl = '';
   console.log('Post mainImage:', post.mainImage);
   console.log('Has asset?', post.mainImage?.asset);
   
   if (post.mainImage?.asset) {
     const imageBuilder = urlForImage(post.mainImage as any);
     console.log('Image builder result:', imageBuilder);
     if (imageBuilder) {
       mainImageUrl = imageBuilder.width(1200).url();
       console.log('Final image URL:', mainImageUrl);
     }
   }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link href="/" className="text-blue-600 hover:underline">Home</Link>
        <span className="mx-2">›</span>
        <Link href="/blog" className="text-blue-600 hover:underline">Blog</Link>
        <span className="mx-2">›</span>
        <span className="text-gray-600">{post.title}</span>
      </nav>

      <article>
        {/* Título */}
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        
        {/* Meta */}
        <div className="flex items-center gap-4 text-gray-600 mb-6">
          {post.author?.name && <span>Por {post.author.name}</span>}
          <span>{formatDate(post.publishedAt)}</span>
        </div>

        {/* Resumo */}
        {post.excerpt && (
          <div className="text-lg text-gray-700 mb-8 p-4 bg-gray-50 rounded-lg">
            {post.excerpt}
          </div>
        )}

        {/* Imagem principal */}
        {mainImageUrl && (
          <div className="mb-8">
            <Image
              src={mainImageUrl}
              alt={post.mainImage?.alt || post.title}
              width={1200}
              height={675}
              style={{ width: '100%', height: 'auto' }}
              className="rounded-lg"
              priority
            />
            {post.mainImage?.caption && (
              <p className="text-sm text-gray-600 text-center mt-2 italic">
                {post.mainImage.caption}
              </p>
            )}
          </div>
        )}

        {/* Conteúdo */}
        <div className="prose prose-lg max-w-none">
          <PortableText value={post.content} components={portableTextComponents} />
        </div>

                 {/* Autor */}
         {post.author && (
           <div className="mt-12 p-6 bg-gray-50 rounded-lg">
             <h3 className="text-lg font-bold mb-4">Sobre o autor</h3>
             <div className="flex items-start gap-4">
               {post.author.image && (() => {
                 const imageBuilder = urlForImage(post.author.image);
                 if (imageBuilder) {
                   return (
                     <Image
                       src={imageBuilder.width(80).height(80).url()}
                       alt={post.author.name}
                       width={80}
                       height={80}
                       className="rounded-full"
                     />
                   );
                 }
                 return null;
               })()}
               <div>
                 <h4 className="font-bold">{post.author.name}</h4>
                 {post.author.role && (
                   <p className="text-gray-600">{post.author.role}</p>
                 )}
               </div>
             </div>
           </div>
         )}
      </article>
    </div>
  );
}
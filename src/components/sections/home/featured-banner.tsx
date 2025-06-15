import React from "react";
import strapiClient from "@/lib/strapiClient";
import Banner from "./banner";
import AdBanner from "./ad-banner";
import { urlForImage } from "@/lib/imageHelper";

// Função para buscar o post principal do banner

// Interface para o resultado da query
interface FeaturedPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: any;
  author?: {
    name?: string;
  };
}

interface FeaturedBannerProps {
  showAd?: boolean; // Prop para alternar entre conteúdo editorial e publicidade
  adConfig?: {
    title?: string;
    subtitle?: string;
    link?: string;
  };
}

// Server Component
export default async function FeaturedBanner({ 
  showAd = true, // Por padrão, mostra publicidade
  adConfig = {
    title: 'Sinais Cripto Expert',
    subtitle: 'Lucre de R$ 500,00 a R$ 5.000 em média por dia no criptomercado, sem precisar olhar gráficos, notícias, nem fazer cursos enormes.',
    link: 'https://eternityscale.com.br/sce-blog/'
  }
}: FeaturedBannerProps) {
  // Mostra banner de publicidade se habilitado
  if (showAd) {
    return <AdBanner {...adConfig} />;
  }

  // Busca post em destaque no servidor
  let featuredPost: FeaturedPost | null = null;
  
  try {
    const response = await strapiClient.getPosts({ limit: 1 });
    if (response.data && response.data[0]) {
      const post = response.data[0];
      featuredPost = {
        _id: post.id,
        title: post.attributes?.title || post.title,
        slug: post.attributes?.slug || post.slug,
        excerpt: post.attributes?.excerpt || post.excerpt,
        coverImage: post.attributes?.featuredImage || post.featuredImage,
        author: {
          name: post.attributes?.author?.data?.attributes?.name || 'Autor'
        }
      };
    }
  } catch (error) {
    console.error('Erro ao buscar post em destaque:', error);
  }

  // Se não houver post, mostra banner de publicidade como fallback
  if (!featuredPost) {
    return <AdBanner {...adConfig} />;
  }

  // Prepara dados do banner
  const bannerData = {
    title: featuredPost.title,
    excerpt: featuredPost.excerpt,
    link: `/post/${featuredPost.slug}`,
    backgroundImage: featuredPost.coverImage ? urlForImage(featuredPost.coverImage)?.url() : undefined,
    author: featuredPost.author?.name
  };

  return <Banner {...bannerData} />;
}
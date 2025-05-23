'use client';

import React from "react";
import { client } from "../../../sanity/client";
import Banner from "./Banner";
import { urlForImage } from "../../../sanity/lib/image";

// Query para buscar o post principal do banner
const featuredPostQuery = `*[_type == "post"] | order(date desc) [0] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  author-> {
    firstName
  }
}`;

// Interface para o resultado da query
interface FeaturedPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: any;
  author?: {
    firstName?: string;
  };
}

export default function FeaturedBanner() {
  const [featuredPost, setFeaturedPost] = React.useState<FeaturedPost | null>(null);
  
  React.useEffect(() => {
    const fetchPost = async () => {
      try {
        const post = await client.fetch(featuredPostQuery) as FeaturedPost | null;
        setFeaturedPost(post);
      } catch (error) {
        console.error('Erro ao buscar post em destaque:', error);
      }
    };
    
    fetchPost();
  }, []);

  // Fallback para quando não existem posts em destaque
  if (!featuredPost) {
    return (
      <Banner
        title="Bitcoin Atinge Nova Máxima Histórica: O Que Esperar do Mercado Cripto"
        category="DESTAQUE"
        subtitle="Analistas preveem alta volatilidade nos próximos dias"
        showBitcoin={true}
        showRocket={true}
      />
    );
  }

  const imageUrl = featuredPost.coverImage ? urlForImage(featuredPost.coverImage)?.url() : undefined;
  
  // Extração do subtítulo do excerpt, quando disponível
  const subtitle = featuredPost.excerpt;

  return (
    <Banner
      title={featuredPost.title}
      category={featuredPost.author?.firstName || 'DESTAQUE'}
      subtitle={subtitle}
      imageUrl={imageUrl}
      slug={featuredPost.slug}
      showBitcoin={!imageUrl} // Mostrar Bitcoin apenas quando não tiver imagem
      showRocket={!imageUrl} // Mostrar foguete apenas quando não tiver imagem
    />
  );
}
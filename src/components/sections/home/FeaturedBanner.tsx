'use client';

import React from "react";
import { client } from "../../../sanity/client";
import Banner from "./Banner";
import AdBanner from "./AdBanner";
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

interface FeaturedBannerProps {
  showAd?: boolean; // Prop para alternar entre conteúdo editorial e publicidade
  adConfig?: {
    title?: string;
    subtitle?: string;
    link?: string;
  };
}

export default function FeaturedBanner({ 
  showAd = true, // Por padrão, mostra publicidade
  adConfig = {
    title: 'Sinais Cripto Expert',
    subtitle: 'Lucre de R$ 500,00 a R$ 5.000 em média por dia no criptomercado, sem precisar olhar gráficos, notícias, nem fazer cursos enormes.',
    link: 'https://eternityscale.com.br/sce'
  }
}: FeaturedBannerProps) {
  const [featuredPost, setFeaturedPost] = React.useState<FeaturedPost | null>(null);
  
  React.useEffect(() => {
    // Só busca post se não for para mostrar publicidade
    if (!showAd) {
      const fetchPost = async () => {
        try {
          const post = await client.fetch(featuredPostQuery) as FeaturedPost | null;
          setFeaturedPost(post);
        } catch (error) {
          console.error('Erro ao buscar post em destaque:', error);
        }
      };
      
      fetchPost();
    }
  }, [showAd]);

  // Se for para mostrar publicidade, retorna o AdBanner
  if (showAd) {
    return (
      <AdBanner
        title={adConfig.title}
        subtitle={adConfig.subtitle}
        link={adConfig.link}
        targetBlank={true}
      />
    );
  }

  // Fallback para quando não existem posts em destaque (modo editorial)
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
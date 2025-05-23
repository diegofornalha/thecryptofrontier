'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { client } from "../../../sanity/client";

interface BreakingNewsTickerProps {
  news?: Array<{title: string; slug?: string}>;
}

interface NewsItem {
  title: string;
  slug?: string;
}

const breakingNewsQuery = `*[_type == "post"] | order(publishedAt desc) [0...5] {
  title,
  "slug": slug.current
}`;

// Fallback de notícias padrão
const defaultNews: NewsItem[] = [
  { title: "Bem-vindo ao The Crypto Frontier - Seu portal de notícias sobre criptomoedas" },
  { title: "Últimas atualizações do mercado de criptomoedas" },
  { title: "Análises e insights sobre blockchain" },
  { title: "Acompanhe as tendências do mercado cripto" }
];

export default function BreakingNewsTicker({ news }: BreakingNewsTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newsItems, setNewsItems] = useState<NewsItem[]>(news || defaultNews);
  const [loading, setLoading] = useState(!news);

  useEffect(() => {
    if (!news) {
      const fetchNews = async () => {
        try {
          const posts = await client.fetch(breakingNewsQuery);
          
          if (posts && posts.length > 0) {
            const formattedNews = posts.map((post: any) => ({
              title: post.title,
              slug: post.slug
            })).filter((item: NewsItem) => item.title);
            
            setNewsItems(formattedNews.length > 0 ? formattedNews : defaultNews);
          } else {
            setNewsItems(defaultNews);
          }
        } catch (error) {
          console.error('Erro ao buscar últimas notícias:', error);
          setNewsItems(defaultNews);
        } finally {
          setLoading(false);
        }
      };
      
      fetchNews();
    }
  }, [news]);

  // Auto rotation
  useEffect(() => {
    if (newsItems.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % newsItems.length);
      }, 5000); // Change every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [newsItems.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + newsItems.length) % newsItems.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % newsItems.length);
  };

  const currentNews = newsItems[currentIndex];

  if (loading) {
    return (
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-12 gap-4">
            {/* Badge ÚLTIMAS NOTÍCIAS */}
            <div className="flex-shrink-0">
              <span className="bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded">
                ÚLTIMAS NOTÍCIAS
              </span>
            </div>
            {/* Área do texto - ocupa todo espaço disponível */}
            <div className="flex-1 overflow-hidden">
              <div className="h-4 bg-blue-500 rounded animate-pulse w-3/4"></div>
            </div>
            {/* Botões */}
            <div className="flex-shrink-0">
              {/* Espaço para botões */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-12 gap-4">
          {/* Badge ÚLTIMAS NOTÍCIAS */}
          <div className="flex-shrink-0">
            <span className="bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded">
              ÚLTIMAS NOTÍCIAS
            </span>
          </div>
          {/* Área do texto - ocupa todo espaço disponível */}
          <div className="flex-1 overflow-hidden">
            {currentNews?.slug ? (
              <Link 
                href={`/post/${currentNews.slug}`}
                className="text-sm text-white whitespace-nowrap hover:text-blue-200 transition-colors cursor-pointer block"
              >
                {currentNews.title}
              </Link>
            ) : (
              <p className="text-sm text-white whitespace-nowrap">
                {currentNews?.title || "Carregando notícias..."}
              </p>
            )}
          </div>
          {/* Botões de navegação */}
          <div className="flex-shrink-0 flex gap-2">
            <button 
              onClick={handlePrevious}
              className="p-1 border border-white hover:bg-blue-500 disabled:opacity-50 rounded transition-colors"
              disabled={newsItems.length <= 1}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={handleNext}
              className="p-1 border border-white hover:bg-blue-500 disabled:opacity-50 rounded transition-colors"
              disabled={newsItems.length <= 1}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
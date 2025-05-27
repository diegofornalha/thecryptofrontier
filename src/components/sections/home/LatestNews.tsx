'use client';

import React from "react";
import Link from "next/link";
import { client } from "../../../sanity/client";
import { formatDate } from "../../../utils/date-utils";

interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  author?: {
    firstName?: string;
    lastName?: string;
  };
  publishedAt: string;
}

// Query responsiva - busca mais notícias para filtrar depois
const latestNewsQuery = `*[_type == "post"] | order(publishedAt desc) [0...15] {
  _id,
  title,
  "slug": slug.current,
  publishedAt,
  author-> {
    firstName,
    lastName
  }
}`;

export default function LatestNews() {
  const [newsItems, setNewsItems] = React.useState<NewsItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [itemsToShow, setItemsToShow] = React.useState(8);

  // Detecta altura disponível e ajusta número de itens
  React.useEffect(() => {
    const calculateItemsToShow = () => {
      const viewportHeight = window.innerHeight;
      const headerHeight = 70; // altura do header
      const tickerHeight = 48; // altura do ticker
      const footerMargin = 100; // margem inferior
      const bannerHeight = window.innerWidth < 640 ? 400 : 
                          window.innerWidth < 768 ? 450 :
                          window.innerWidth < 1024 ? 500 :
                          window.innerWidth < 1280 ? 550 : 600;
      
      const availableHeight = viewportHeight - headerHeight - tickerHeight - bannerHeight - footerMargin;
      const itemHeight = 80; // altura aproximada de cada item de notícia
      
      const possibleItems = Math.floor(availableHeight / itemHeight);
      const items = Math.max(6, Math.min(possibleItems, 12)); // Entre 6 e 12 itens
      
      setItemsToShow(items);
    };

    calculateItemsToShow();
    window.addEventListener('resize', calculateItemsToShow);
    return () => window.removeEventListener('resize', calculateItemsToShow);
  }, []);

  React.useEffect(() => {
    const fetchNews = async () => {
      try {
        const posts = await client.fetch(latestNewsQuery);
        setNewsItems(posts);
      } catch (error) {
        console.error('Erro ao buscar últimas notícias:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white p-4">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: itemsToShow }, (_, i) => (
            <div key={i} className="border-b border-gray-200 pb-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-4">
      <div className="space-y-4">
        {newsItems.slice(0, itemsToShow).map((item) => (
          <article key={item._id} className="border-b border-gray-200 pb-4 last:border-b-0">
            <Link href={`/post/${item.slug}`}>
              <h2 className="text-base font-semibold mb-1 text-gray-900 hover:text-blue-600 cursor-pointer">
                {item.title}
              </h2>
            </Link>
            <div className="text-sm text-gray-500">
              <span suppressHydrationWarning>
                {formatDate(item.publishedAt).toUpperCase()}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
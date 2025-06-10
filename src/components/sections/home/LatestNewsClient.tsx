'use client';

import React from "react";
import Link from "next/link";

interface NewsItem {
  _id: string;
  title: string;
  slug: string;
  author?: {
    name?: string;
  };
  publishedAt: string;
}

interface LatestNewsClientProps {
  newsItems: NewsItem[];
}

export default function LatestNewsClient({ newsItems }: LatestNewsClientProps) {
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
      const itemHeight = 60; // altura aproximada de cada item de notícia sem data
      
      const possibleItems = Math.floor(availableHeight / itemHeight);
      const items = Math.max(6, Math.min(possibleItems, 12)); // Entre 6 e 12 itens
      
      setItemsToShow(items);
    };

    calculateItemsToShow();
    window.addEventListener('resize', calculateItemsToShow);
    return () => window.removeEventListener('resize', calculateItemsToShow);
  }, []);

  return (
    <div className="w-full bg-white p-4">
      <h3 className="text-lg font-bold mb-4 text-gray-900">
        Últimas Notícias
      </h3>
      <div className="space-y-4">
        {newsItems.slice(0, itemsToShow).map((item) => (
          <article 
            key={item._id} 
            className="border-b border-gray-200 pb-4 last:border-b-0"
          >
            <Link href={`/post/${item.slug}`}>
              <h4 className="text-base font-semibold text-gray-900 hover:text-blue-600 cursor-pointer mb-1">
                {item.title}
              </h4>
            </Link>
            {item.author?.name && (
              <p className="text-xs text-gray-500">
                por {item.author.name}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
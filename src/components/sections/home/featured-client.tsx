'use client';

import React from "react";
import Link from "next/link";
import { formatDate } from "../../../utils/date-utils";

interface FeaturedClientProps {
  featuredPosts: any[];
}

export default function FeaturedClient({ featuredPosts }: FeaturedClientProps) {
  const [itemsToShow, setItemsToShow] = React.useState(8);

  // Detecta altura disponível e ajusta número de itens
  React.useEffect(() => {
    const calculateItemsToShow = () => {
      const viewportHeight = window.innerHeight;
      const headerHeight = 70;
      const tickerHeight = 48;
      const footerMargin = 100;
      const bannerHeight = window.innerWidth < 640 ? 400 : 
                          window.innerWidth < 768 ? 450 :
                          window.innerWidth < 1024 ? 500 :
                          window.innerWidth < 1280 ? 550 : 600;
      
      const availableHeight = viewportHeight - headerHeight - tickerHeight - bannerHeight - footerMargin;
      const itemHeight = 80; // altura aproximada de cada item
      
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
      <div className="space-y-4">
        {featuredPosts.slice(0, itemsToShow).map((post: any) => (
          <article key={post._id} className="border-b border-gray-200 pb-4 last:border-b-0">
            <Link href={`/post/${post.slug}`}>
              <h2 className="text-base font-semibold mb-1 text-gray-900 hover:text-blue-600 cursor-pointer">
                {post.title}
              </h2>
            </Link>
            <div className="text-sm text-gray-500">
              <span suppressHydrationWarning>
                {formatDate(post.date).toUpperCase()}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
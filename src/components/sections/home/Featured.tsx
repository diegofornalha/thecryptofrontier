'use client';

import React from "react";
import Link from "next/link";
import { client } from "../../../sanity/client";
import { formatDate } from "../../../utils/date-utils";

// Query responsiva - busca posts em destaque diferentes dos últimos posts
const featuredPostsQuery = `*[_type == "post"] | order(date desc) [3...20] {
  _id,
  title,
  "slug": slug.current,
  date
}`;

export default function Featured() {
  const [featuredPosts, setFeaturedPosts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
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
  
  React.useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await client.fetch(featuredPostsQuery);
        setFeaturedPosts(posts);
      } catch (error) {
        console.error('Erro ao buscar posts em destaque:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white p-4">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: itemsToShow }, (_, i) => (
            <div key={i} className="border-b border-gray-200 pb-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!featuredPosts || featuredPosts.length === 0) {
    return (
      <div className="w-full bg-white p-4">
        <p className="text-gray-500 text-center">Nenhum post em destaque no momento.</p>
      </div>
    );
  }

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
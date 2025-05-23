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
  date: string;
}

const latestNewsQuery = `*[_type == "post"] | order(date desc) [0...3] {
  _id,
  title,
  "slug": slug.current,
  date,
  author-> {
    firstName,
    lastName
  }
}`;

export default function LatestNews() {
  const [newsItems, setNewsItems] = React.useState<NewsItem[]>([]);
  const [loading, setLoading] = React.useState(true);

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
          {[1, 2, 3].map((i) => (
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
        {newsItems.map((item) => (
          <article key={item._id} className="border-b border-gray-200 pb-4 last:border-b-0">
            <Link href={`/post/${item.slug}`}>
              <h2 className="text-base font-semibold mb-1 text-gray-900 hover:text-blue-600 cursor-pointer">
                {item.title}
              </h2>
            </Link>
            <div className="text-sm text-gray-500">
              <span suppressHydrationWarning>
                {formatDate(item.date).toUpperCase()}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
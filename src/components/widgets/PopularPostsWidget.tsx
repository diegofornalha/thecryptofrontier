'use client';

import React, { useEffect, useState } from 'react';
import CryptoNewsCard from '@/components/sections/CryptoNewsCard';
import { client } from '@/sanity/client';

const popularPostsQuery = `*[_type == "post"] | order(views desc, publishedAt desc) [0...5] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  publishedAt,
  author-> {
    firstName,
    lastName
  },
  category-> {
    title,
    "slug": slug.current
  }
}`;

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: any;
  publishedAt?: string;
  author?: {
    firstName?: string;
    lastName?: string;
  };
  category?: {
    title: string;
    slug: string;
  };
}

export default function PopularPostsWidget() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await client.fetch(popularPostsQuery);
        setPosts(data || []);
      } catch (error) {
        console.error('Erro ao buscar posts populares:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-[#111] mb-4 pb-2 border-b border-gray-200">
        Posts Populares
      </h3>
      <div className="space-y-4">
        {loading ? (
          <>
            <div className="h-20 bg-gray-100 animate-pulse rounded" />
            <div className="h-20 bg-gray-100 animate-pulse rounded" />
            <div className="h-20 bg-gray-100 animate-pulse rounded" />
          </>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <CryptoNewsCard
              key={post._id}
              {...post}
              horizontal
            />
          ))
        ) : (
          <p className="text-gray-600 text-sm">Nenhum post disponível</p>
        )}
      </div>
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import PopularPostItem from './PopularPostItem';
import strapiClient from "@/lib/strapiClient";

interface Post {
  _id: string;
  title: string;
  slug: string;
  publishedAt?: string;
  estimatedReadingTime?: number;
}

export default function PopularPostsWidget() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await strapiClient.getPopularPosts(5);
        if (response.data) {
          const formattedPosts = response.data.map((post: any) => ({
            _id: post.id,
            title: post.attributes?.title || post.title,
            slug: post.attributes?.slug || post.slug,
            publishedAt: post.attributes?.publishedAt || post.publishedAt,
            estimatedReadingTime: Math.ceil((post.attributes?.content || '').split(' ').length / 200)
          }));
          setPosts(formattedPosts);
        }
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
            <div className="h-16 bg-gray-100 animate-pulse rounded mb-4" />
            <div className="h-16 bg-gray-100 animate-pulse rounded mb-4" />
            <div className="h-16 bg-gray-100 animate-pulse rounded" />
          </>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PopularPostItem
              key={post._id}
              title={post.title}
              slug={post.slug}
              publishedAt={post.publishedAt}
              readTime={post.estimatedReadingTime}
            />
          ))
        ) : (
          <p className="text-gray-600 text-sm">Nenhum post disponível</p>
        )}
      </div>
    </div>
  );
}
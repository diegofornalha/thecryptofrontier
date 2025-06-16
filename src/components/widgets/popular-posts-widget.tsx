import React from 'react';
import PopularPostItem from './popular-post-item';
import strapiClient from "@/lib/strapiClient";

interface Post {
  id: string | number;
  title: string;
  slug: string;
  publishedAt?: string;
  createdAt?: string;
  content?: string;
}

// Server Component
export default async function PopularPostsWidget() {
  let posts: Post[] = [];
  
  try {
    const response = await strapiClient.getPosts({
      pageSize: 5,
      sort: 'publishedAt:desc',
      status: 'published'
    });
    
    if (response.data) {
      posts = response.data.map((post: any) => ({
        id: post.id || post._id,
        title: post.attributes?.title || post.title || '',
        slug: post.attributes?.slug || post.slug || '',
        publishedAt: post.attributes?.publishedAt || post.publishedAt,
        createdAt: post.attributes?.createdAt || post.createdAt,
        content: post.attributes?.content || post.content || ''
      }));
    }
  } catch (error) {
    console.error('Erro ao buscar posts populares:', error);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-[#111] mb-4 pb-2 border-b border-gray-200">
        Posts Populares
      </h3>
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PopularPostItem
              key={`popular-${post.id}`}
              title={post.title}
              slug={post.slug}
              publishedAt={post.publishedAt}
              readTime={Math.ceil((post.content || '').split(' ').length / 200)}
            />
          ))
        ) : (
          <p className="text-gray-600 text-sm">Nenhum post disponível</p>
        )}
      </div>
    </div>
  );
}
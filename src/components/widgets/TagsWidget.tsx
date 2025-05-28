'use client';

import React, { useEffect, useState } from 'react';
import { client } from '@/sanity/client';

const tagsQuery = `*[_type == "tag"] | order(title asc) [0...20] {
  _id,
  title,
  "slug": slug.current
}`;

interface Tag {
  _id: string;
  title: string;
  slug: string;
}

export default function TagsWidget() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const data = await client.fetch(tagsQuery);
        setTags(data || []);
      } catch (error) {
        console.error('Erro ao buscar tags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-[#111] mb-4 pb-2 border-b border-gray-200">
        Tags Populares
      </h3>
      <div className="flex flex-wrap gap-2">
        {loading ? (
          <>
            <div className="h-8 w-20 bg-gray-100 animate-pulse rounded" />
            <div className="h-8 w-24 bg-gray-100 animate-pulse rounded" />
            <div className="h-8 w-16 bg-gray-100 animate-pulse rounded" />
            <div className="h-8 w-28 bg-gray-100 animate-pulse rounded" />
          </>
        ) : tags.length > 0 ? (
          tags.map((tag) => (
            <a
              key={tag._id}
              href={`/tag/${tag.slug}`}
              className="inline-block bg-gray-100 hover:bg-[#4db2ec] hover:text-white text-gray-700 text-sm px-3 py-1 rounded transition-colors"
            >
              {tag.title}
            </a>
          ))
        ) : (
          <p className="text-gray-600 text-sm">Nenhuma tag disponível</p>
        )}
      </div>
    </div>
  );
}
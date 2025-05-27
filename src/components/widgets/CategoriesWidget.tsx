'use client';

import React, { useEffect, useState } from 'react';
import { client } from '@/sanity/client';

const categoriesQuery = `*[_type == "category"] | order(title asc) {
  _id,
  title,
  "slug": slug.current,
  "postCount": count(*[_type == "post" && references(^._id)])
}`;

interface Category {
  _id: string;
  title: string;
  slug: string;
  postCount: number;
}

export default function CategoriesWidget() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await client.fetch(categoriesQuery);
        setCategories(data || []);
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-[#111] mb-4 pb-2 border-b border-gray-200">
        Categorias
      </h3>
      <ul className="space-y-2">
        {loading ? (
          <>
            <li className="h-10 bg-gray-100 animate-pulse rounded" />
            <li className="h-10 bg-gray-100 animate-pulse rounded" />
            <li className="h-10 bg-gray-100 animate-pulse rounded" />
          </>
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <li key={category._id}>
              <a
                href={`/categoria/${category.slug}`}
                className="flex justify-between items-center py-2 px-3 hover:bg-gray-50 rounded transition-colors"
              >
                <span className="text-[#666] hover:text-[#4db2ec]">{category.title}</span>
                <span className="text-sm text-gray-400">({category.postCount})</span>
              </a>
            </li>
          ))
        ) : (
          <li className="text-gray-600 text-sm">Nenhuma categoria disponível</li>
        )}
      </ul>
    </div>
  );
}
"use client";

import Link from 'next/link';
import Image from 'next/image';

interface PostCardProps {
  title: string;
  excerpt?: string;
  slug: string;
  publishedAt: string;
  author?: string;
  featuredImage?: string;
  tags?: string[];
  featured?: boolean;
}

export default function PostCard({
  title,
  excerpt,
  slug,
  publishedAt,
  author,
  featuredImage,
  tags,
  featured = false
}: PostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article className={`
      bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
      ${featured ? 'border-2 border-blue-500' : 'border border-gray-200'}
    `}>
      {/* Imagem destacada */}
      {featuredImage && (
        <div className="relative h-48 w-full">
          <Image
            src={featuredImage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {featured && (
            <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              ⭐ Destaque
            </div>
          )}
        </div>
      )}

      <div className="p-6">
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Título */}
        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
          <Link href={`/post/${slug}`}>
            {title}
          </Link>
        </h2>

        {/* Resumo */}
        {excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
            {excerpt}
          </p>
        )}

        {/* Meta informações */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            {author && (
              <>
                <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {author.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span>{author}</span>
                <span>•</span>
              </>
            )}
            <time dateTime={publishedAt}>
              {formatDate(publishedAt)}
            </time>
          </div>

          {/* Link de leitura */}
          <Link
            href={`/post/${slug}`}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1 transition-colors"
          >
            <span>Ler mais</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
} 
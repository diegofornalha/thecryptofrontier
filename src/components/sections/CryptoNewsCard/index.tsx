'use client';

import Link from 'next/link';
import Image from 'next/image';
import { urlForImage } from '@/strapi/lib/image';

interface CryptoNewsCardProps {
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: any;
  authorName?: string;
  publishedAt?: string;
  category?: {
    title: string;
    slug: string;
  };
  readTime?: number;
  featured?: boolean;
  horizontal?: boolean;
}

export default function CryptoNewsCard({
  title,
  slug,
  excerpt,
  coverImage,
  authorName,
  publishedAt,
  category,
  readTime = 3,
  featured = false,
  horizontal = false,
}: CryptoNewsCardProps) {
  const imageUrl = coverImage ? urlForImage(coverImage)?.url() : '/placeholder-news.jpg';
  const displayAuthorName = authorName || 'Redação';
  const formattedDate = publishedAt ? new Date(publishedAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) : '';

  if (horizontal) {
    return (
      <article className="group flex gap-4 pb-6 border-b border-gray-200 hover:opacity-80 transition-opacity">
        {/* Image */}
        <Link href={`/post/${slug}`} className="flex-shrink-0">
          <div className="relative w-[140px] h-[105px] overflow-hidden rounded">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              placeholder="empty"
              style={{ backgroundColor: '#f0f0f0' }}
            />
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Category */}
          {category && (
            <Link 
              href={`/categoria/${category.slug}`}
              className="inline-block text-xs font-bold text-[#4db2ec] uppercase tracking-wide mb-2 hover:underline"
            >
              {category.title}
            </Link>
          )}

          {/* Title */}
          <h3 className="mb-2">
            <Link 
              href={`/post/${slug}`}
              className="text-lg font-bold text-[#111] leading-tight hover:text-[#4db2ec] transition-colors line-clamp-2"
            >
              {title}
            </Link>
          </h3>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-[#666]">
            <span className="font-medium">{displayAuthorName}</span>
            <span>•</span>
            <time>{formattedDate}</time>
            <span>•</span>
            <span>{readTime} min de leitura</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`group ${featured ? 'col-span-2 row-span-2' : ''}`}>
      <Link href={`/post/${slug}`} className="block">
        {/* Image Container */}
        <div className={`relative overflow-hidden rounded mb-3 ${featured ? 'h-[400px]' : 'h-[200px]'}`}>
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            placeholder="empty"
            style={{ backgroundColor: '#f0f0f0' }}
          />
          
          {/* Category Badge */}
          {category && (
            <div className="absolute top-3 left-3">
              <span className="bg-[#4db2ec] text-white text-xs font-bold px-3 py-1 rounded uppercase">
                {category.title}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div>
          {/* Title */}
          <h3 className={`${featured ? 'text-2xl' : 'text-lg'} font-bold text-[#111] mb-2 leading-tight group-hover:text-[#4db2ec] transition-colors line-clamp-2`}>
            {title}
          </h3>

          {/* Excerpt - only for featured */}
          {featured && excerpt && (
            <p className="text-[#666] text-sm mb-3 line-clamp-2">
              {excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-[#666]">
            <span className="font-medium">{displayAuthorName}</span>
            <span>•</span>
            <time>{formattedDate}</time>
            {!featured && (
              <>
                <span>•</span>
                <span>{readTime} min</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
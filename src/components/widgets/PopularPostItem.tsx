import React from 'react';
import Link from 'next/link';

interface PopularPostItemProps {
  title: string;
  slug: string;
  publishedAt?: string;
  readTime?: number;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const PopularPostItem: React.FC<PopularPostItemProps> = ({ 
  title, 
  slug, 
  publishedAt,
  readTime = 3 
}) => {
  return (
    <article className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
      <Link 
        href={`/post/${slug}`}
        className="block group"
      >
        <h4 className="text-base font-semibold text-[#111] mb-2 leading-tight group-hover:text-[#4db2ec] transition-colors line-clamp-2">
          {title}
        </h4>
        <div className="flex items-center gap-3 text-xs text-[#999]">
          {publishedAt && (
            <>
              <time>{formatDate(publishedAt)}</time>
              <span>•</span>
            </>
          )}
          <span>{readTime} min de leitura</span>
        </div>
      </Link>
    </article>
  );
};

export default PopularPostItem;
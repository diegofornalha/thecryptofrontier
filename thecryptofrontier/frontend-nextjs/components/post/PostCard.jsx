import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const PostCard = ({ post, locale = 'en' }) => {
    if (!post) return null;
    
    const data = post.attributes || post;
    const { title, excerpt, slug, publishedAt, createdAt, featuredImage } = data;
    
    // Extrai a URL da imagem
    const featuredImageUrl = featuredImage?.url || featuredImage?.data?.attributes?.url;
    const fullImageUrl = featuredImageUrl
        ? (featuredImageUrl.startsWith('http')
            ? featuredImageUrl
            : `${process.env.NEXT_PUBLIC_STRAPI_URL || 'https://ale-blog.agentesintegrados.com'}${featuredImageUrl}`)
        : null;
    
    // Formata a data
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Imagem em destaque */}
            {fullImageUrl && (
                <div className="relative h-48 w-full">
                    <Image
                        src={fullImageUrl}
                        alt={title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}
            
            {/* Conteúdo */}
            <div className="p-6">
                {/* Título */}
                <h3 className="text-xl font-bold mb-2 text-gray-900 hover:text-blue-600 transition-colors">
                    <Link href={`/${locale}/post/${slug}`}>
                        {title}
                    </Link>
                </h3>
                
                {/* Resumo */}
                {excerpt && (
                    <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                        {excerpt}
                    </p>
                )}
                
                {/* Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{formatDate(publishedAt || createdAt)}</span>
                    <Link 
                        href={`/${locale}/post/${slug}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Ler mais →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PostCard; 
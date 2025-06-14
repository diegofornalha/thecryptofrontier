'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/strapi/lib/image';
import { PortableText } from '@portabletext/react';
import { client } from '@/strapi/lib/client';

interface AuthorCardProps {
  author: {
    _id: string;
    name?: string;
    image?: any;
    role?: string;
    slug?: { current: string };
    bio?: any[];
    social?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  };
  showBio?: boolean;
}

interface AuthorPost {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage?: any;
  categories?: Array<{
    title: string;
  }>;
}

const AuthorCard: React.FC<AuthorCardProps> = ({ author, showBio = true }) => {
  const [authorPosts, setAuthorPosts] = React.useState<AuthorPost[]>([]);
  
  React.useEffect(() => {
    if (author?._id) {
      // Buscar os últimos 3 posts do autor
      const query = `*[_type in ["post", "agentPost"] && author._ref == $authorId] | order(publishedAt desc) [0...3] {
        _id,
        title,
        slug,
        mainImage,
        "categories": categories[]->{
          title
        }
      }`;
      
      client.fetch(query, { authorId: author._id })
        .then(posts => setAuthorPosts(posts))
        .catch(err => console.error('Erro ao buscar posts do autor:', err));
    }
  }, [author?._id]);

  if (!author) return null;

  const authorImage = author.image ? urlForImage(author.image).width(150).height(150).url() : null;
  const authorName = author.name || 'Autor';

  return (
    <div className="my-16 max-w-[1200px] mx-auto">
      {/* Seção do Autor */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-16">
        {/* Coluna da esquerda - Author */}
        <div className="lg:w-[200px] flex-shrink-0 text-center lg:text-left">
          <h2 className="text-3xl font-bold mb-8 text-[#111]">Autor</h2>
          <div className="inline-block">
            {authorImage ? (
              <Image
                src={authorImage}
                alt={authorName}
                width={150}
                height={150}
                className="rounded-full object-cover shadow-lg mx-auto"
                style={{ border: '4px solid #f0f0f0' }}
              />
            ) : (
              <div className="w-[150px] h-[150px] bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center shadow-lg mx-auto" style={{ border: '4px solid #f0f0f0' }}>
                <span className="text-4xl font-bold text-white">
                  {authorName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            {/* Redes Sociais - Movidas para baixo da foto */}
            {author.social && (author.social.twitter || author.social.linkedin || author.social.github) && (
              <div className="mt-4 flex gap-3 justify-center">
                {author.social.twitter && (
                  <a
                    href={author.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#4db2ec] transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                    </svg>
                  </a>
                )}
                {author.social.linkedin && (
                  <a
                    href={author.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[#0077B5] transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {author.social.github && (
                  <a
                    href={author.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-[#4db2ec] to-[#3a9bd4] text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:from-[#1e3a8a] hover:to-[#1e40af] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
                    aria-label="Oferta"
                  >
                    OFERTA
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Coluna da direita - Bio */}
        <div className="flex-1">
          <div className="bg-[#f5f5f5] p-8 lg:p-10 rounded-xl">
            <h3 className="text-[28px] lg:text-[32px] font-bold mb-4 text-[#4db2ec] text-center">
              {author.slug ? (
                <Link 
                  href={`/autor/${author.slug.current}`}
                  className="hover:underline hover:text-[#3a9bd4] transition-colors"
                >
                  {authorName}
                </Link>
              ) : (
                authorName
              )}
            </h3>
            
            {showBio && author.bio && (
              <div className="text-[16px] lg:text-[18px] text-[#111] leading-[1.6] font-normal text-left">
                <PortableText 
                  value={author.bio}
                  components={{
                    block: {
                      normal: ({ children, index }) => {
                        // Renderiza todos os blocos como um texto contínuo
                        const isLastBlock = index === author.bio.length - 1;
                        return (
                          <span>
                            {children}
                            {!isLastBlock && ' '}
                          </span>
                        );
                      },
                    },
                    marks: {
                      link: ({ children, value }) => (
                        <a 
                          href={value.href} 
                          className="text-[#4db2ec] hover:underline font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                    },
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* More from Author */}
      {authorPosts.length > 0 && (
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-3xl font-bold mb-10 text-[#111]">
            Mais do Autor
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {authorPosts.map((post) => (
              <article key={post._id} className="group">
                <Link 
                  href={`/post/${post.slug.current}`}
                  className="block"
                >
                  <div className="relative overflow-hidden rounded-xl mb-4 shadow-md">
                    {post.mainImage ? (
                      <Image
                        src={urlForImage(post.mainImage).width(400).height(250).url()}
                        alt={post.title}
                        width={400}
                        height={250}
                        className="w-full h-[220px] object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-[220px] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <span className="text-gray-500 font-medium">Sem imagem</span>
                      </div>
                    )}
                  </div>
                  
                  {post.categories && post.categories[0] && (
                    <p className="text-sm font-semibold text-[#4db2ec] uppercase tracking-wide mb-2">
                      {post.categories[0].title}
                    </p>
                  )}
                  
                  <h4 className="font-bold text-xl text-[#111] group-hover:text-[#4db2ec] transition-colors leading-tight line-clamp-3">
                    {post.title}
                  </h4>
                </Link>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorCard;
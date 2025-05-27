import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/sanity/lib/image';
import { PortableText } from '@portabletext/react';

interface AuthorCardProps {
  author: {
    _id: string;
    name?: string;
    image?: any;
    role?: string;
    slug?: { current: string };
    bio?: any[];
  };
  showBio?: boolean;
}

const AuthorCard: React.FC<AuthorCardProps> = ({ author, showBio = true }) => {
  if (!author) return null;

  const authorImage = author.image ? urlForImage(author.image).width(80).height(80).url() : null;
  const authorName = author.name || 'Autor';

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {authorImage ? (
            <Image
              src={authorImage}
              alt={authorName}
              width={80}
              height={80}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-600">
                {authorName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#111] mb-1">
            {author.slug ? (
              <Link 
                href={`/autor/${author.slug.current}`}
                className="hover:text-[#4db2ec] transition-colors"
              >
                {authorName}
              </Link>
            ) : (
              authorName
            )}
          </h3>
          
          {author.role && (
            <p className="text-sm text-[#666] mb-3">{author.role}</p>
          )}

          {showBio && author.bio && (
            <div className="text-sm text-[#666] prose prose-sm max-w-none">
              <PortableText 
                value={author.bio}
                components={{
                  block: {
                    normal: ({ children }) => <p className="mb-2">{children}</p>,
                  },
                  marks: {
                    link: ({ children, value }) => (
                      <a 
                        href={value.href} 
                        className="text-[#4db2ec] hover:underline"
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
  );
};

export default AuthorCard;
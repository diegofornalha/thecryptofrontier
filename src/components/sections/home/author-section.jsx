'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { urlForImage } from '@/lib/imageHelper';
import strapiClient from '@/lib/strapiClient';
export default function AuthorSection() {
    var _a, _b;
    const [author, setAuthor] = React.useState(null);
    React.useEffect(() => {
        // Buscar o autor Alexandre Bianchi do Strapi
        strapiClient.getAuthorBySlug('alexandre-bianchi')
            .then(data => {
            var _a, _b, _c, _d, _e, _f;
            if (data) {
                // Adaptar dados do Strapi para o formato esperado
                const adaptedAuthor = {
                    _id: data.id,
                    name: ((_a = data.attributes) === null || _a === void 0 ? void 0 : _a.name) || data.name,
                    image: ((_b = data.attributes) === null || _b === void 0 ? void 0 : _b.avatar) || data.avatar,
                    role: ((_c = data.attributes) === null || _c === void 0 ? void 0 : _c.role) || data.role,
                    slug: { current: ((_d = data.attributes) === null || _d === void 0 ? void 0 : _d.slug) || data.slug },
                    bio: ((_e = data.attributes) === null || _e === void 0 ? void 0 : _e.bio) || data.bio,
                    social: ((_f = data.attributes) === null || _f === void 0 ? void 0 : _f.social) || data.social || {}
                };
                setAuthor(adaptedAuthor);
            }
        })
            .catch(err => console.error('Erro ao buscar autor:', err));
    }, []);
    if (!author)
        return null;
    const authorImage = author.image ? urlForImage(author.image).width(80).height(80).url() : null;
    return (<div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] p-4 rounded-xl shadow-xl">
      <div className="text-center">
        {/* Foto do autor */}
        <div className="mb-3">
          {authorImage ? (<Image src={authorImage} alt={author.name || 'Autor'} width={70} height={70} className="rounded-full object-cover shadow-lg mx-auto" style={{ border: '3px solid #4db2ec' }}/>) : (<div className="w-[70px] h-[70px] bg-gradient-to-br from-[#4db2ec] to-[#3a9bd4] rounded-full flex items-center justify-center shadow-lg mx-auto" style={{ border: '3px solid #4db2ec' }}>
              <span className="text-xl font-bold text-white">
                {((_a = author.name) === null || _a === void 0 ? void 0 : _a.charAt(0).toUpperCase()) || 'A'}
              </span>
            </div>)}
        </div>

        {/* Nome e cargo */}
        <h2 className="text-lg font-bold mb-1 text-white">
          {author.slug ? (<Link href={`/autor/${author.slug.current}`} className="hover:text-[#4db2ec] transition-colors">
              {author.name}
            </Link>) : (author.name)}
        </h2>
        
        {author.role && (<p className="text-[#4db2ec] text-xs font-medium mb-2">{author.role}</p>)}
        
        {/* Bio */}
        <p className="text-gray-300 text-xs mb-3 max-w-md mx-auto leading-tight">
          Trader e investidor profissional, com mais de 10 anos de experiência no mercado financeiro, especializado em criptomoedas. Criador do treinamento "Trader Crypto Expert" que ensina a operar no mercado de criptoativos de forma segura e lucrativa.
        </p>

        {/* Redes Sociais */}
        {author.social && (author.social.twitter || author.social.linkedin) && (<div className="flex gap-3 justify-center mb-3">
            {author.social.twitter && (<a href={author.social.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#4db2ec] transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                </svg>
              </a>)}
            {author.social.linkedin && (<a href={author.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#0077B5] transition-colors" aria-label="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>)}
          </div>)}
        
        {/* Botão de Oferta */}
        {((_b = author.social) === null || _b === void 0 ? void 0 : _b.github) && (<a href={author.social.github} target="_blank" rel="noopener noreferrer" className="inline-block bg-gradient-to-r from-[#4db2ec] to-[#3a9bd4] text-white px-4 py-1.5 rounded-md font-semibold hover:from-[#3a9bd4] hover:to-[#2b86bf] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg text-xs">
            CONHEÇA O SINAIS CRIPTO EXPERT
          </a>)}
      </div>
    </div>);
}

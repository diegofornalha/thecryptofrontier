'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface AdBannerProps {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  link?: string;
  targetBlank?: boolean;
  className?: string;
  showBitcoinAnimation?: boolean;
}

export default function AdBanner({ 
  imageUrl = '/ads.jpeg',
  title = 'Sinais Cripto Expert',
  subtitle = 'Lucre de R$ 500,00 a R$ 5.000 em média por dia no criptomercado, sem precisar olhar gráficos, notícias, nem fazer cursos enormes.',
  link = 'https://eternityscale.com.br/sce-fb',
  targetBlank = true,
  className = '',
  showBitcoinAnimation = true
}: AdBannerProps) {
  const [imageError, setImageError] = useState(false);

  const content = (
    <div className={`relative w-full h-[400px] sm:h-[450px] md:h-[500px] lg:h-[550px] xl:h-[600px] rounded-xl overflow-hidden cursor-pointer group ${className}`}>
      
      {/* Background com Bitcoin e Animações */}
      <div className="absolute inset-0">
        {/* Gradient de fundo com estrelas */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" style={{
          backgroundImage: showBitcoinAnimation ? `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='stars' x='0' y='0' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='5' cy='5' r='1' fill='white' opacity='0.5'/%3E%3Ccircle cx='20' cy='12' r='1.5' fill='orange' opacity='0.7'/%3E%3Ccircle cx='35' cy='8' r='0.8' fill='white' opacity='0.6'/%3E%3Ccircle cx='45' cy='25' r='1' fill='yellow' opacity='0.8'/%3E%3Ccircle cx='10' cy='40' r='0.7' fill='white' opacity='0.4'/%3E%3Ccircle cx='50' cy='45' r='1.2' fill='orange' opacity='0.6'/%3E%3Ccircle cx='25' cy='55' r='0.9' fill='white' opacity='0.7'/%3E%3Ccircle cx='55' cy='15' r='0.6' fill='yellow' opacity='0.5'/%3E%3Ccircle cx='15' cy='20' r='0.8' fill='white' opacity='0.6'/%3E%3Ccircle cx='40' cy='35' r='1.1' fill='orange' opacity='0.7'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='60' height='60' fill='%23111827' /%3E%3Crect width='60' height='60' fill='url(%23stars)' /%3E%3C/svg%3E")` : undefined
        }} />
        
        {/* Bitcoin coin - Responsivo */}
        {showBitcoinAnimation && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-40 group-hover:opacity-60 transition-opacity duration-500">
            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-2xl flex items-center justify-center animate-pulse-slow">
              <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-yellow-900">₿</span>
            </div>
          </div>
        )}
        
        {/* Foguete - Responsivo */}
        {showBitcoinAnimation && (
          <div className="absolute bottom-[15%] sm:bottom-[20%] left-[5%] sm:left-[10%] transform rotate-45 animate-float opacity-50 group-hover:opacity-70 transition-opacity duration-500">
            <div className="w-8 h-12 sm:w-10 sm:h-15 md:w-12 md:h-18 lg:w-16 lg:h-24 xl:w-20 xl:h-30 bg-gradient-to-br from-red-500 to-orange-600 rounded-t-full relative">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-b-full" />
              {/* Flame effect */}
              <div className="absolute -bottom-2 sm:-bottom-3 md:-bottom-4 lg:-bottom-6 left-1/2 transform -translate-x-1/2 w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 bg-gradient-to-t from-orange-500 via-yellow-400 to-red-400 rounded-full animate-flicker opacity-90" />
            </div>
          </div>
        )}
      </div>

      {/* Imagem Publicitária sobreposta (se existir) */}
      {!imageError && imageUrl && (
        <div className="relative w-full h-full">
          <Image
            src={imageUrl}
            alt={title || "Banner Publicitário"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-75 group-hover:opacity-85"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
            onError={() => setImageError(true)}
          />
          
          {/* Overlay gradient para melhor legibilidade */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/70 transition-all duration-300" />
        </div>
      )}

      {/* Texto sobreposto */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 z-10">
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          {title && (
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white leading-tight shadow-lg drop-shadow-2xl">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-gray-200 text-sm sm:text-base md:text-lg lg:text-xl max-w-3xl drop-shadow-lg">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Indicador de banner publicitário */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/60 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full z-20">
        <span className="text-white text-xs font-medium">OFERTA POR TEMPO LIMITADO</span>
      </div>

      {/* Efeito hover com borda dourada */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-yellow-500/50 rounded-xl transition-all duration-300" />
      
      {/* Brilho dourado adicional no hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/0 via-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:to-transparent rounded-xl transition-all duration-500" />
    </div>
  );

  // Se tiver link, envolve com Link ou tag <a>
  if (link) {
    if (targetBlank || link.startsWith('http')) {
      return (
        <a 
          href={link} 
          target={targetBlank ? "_blank" : "_self"} 
          rel={targetBlank ? "noopener noreferrer" : undefined}
          className="block"
        >
          {content}
        </a>
      );
    } else {
      return (
        <Link href={link} className="block">
          {content}
        </Link>
      );
    }
  }

  return content;
} 
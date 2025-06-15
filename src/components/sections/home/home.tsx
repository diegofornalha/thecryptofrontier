'use client';

import React from 'react';
import LatestNews from './latest-news';
import Featured from './featured';
import FeaturedBanner from './featured-banner';
import BreakingNewsTicker from './breaking-news-ticker';
import AuthorSection from './author-section';

export default function Home() {
  return (
    <div className="bg-white">
      {/* Breaking News Ticker - Forçado para ser visível */}
      <div className="w-full relative z-10">
        <BreakingNewsTicker />
      </div>

      {/* Main Content Grid - Alinhado exatamente com o header */}
      <div className="max-w-7xl mx-auto px-4 py-8 pb-16">
        <div className="flex flex-col lg:flex-row">
          {/* Coluna esquerda - Últimas Notícias (1/4) - Alinhada com lupa */}
          <div className="w-full lg:w-1/4 lg:pr-6">
            <h2 className="text-2xl font-bold mb-4 border-b border-gray-200 pb-4">Últimas Notícias</h2>
            <LatestNews />
          </div>
          
          {/* Coluna central - Banner destacado (1/2) */}
          <div className="w-full lg:w-1/2 lg:px-6">
            <FeaturedBanner />
            
            {/* Author Section - Logo abaixo do banner */}
            <div className="mt-8">
              <AuthorSection />
            </div>
          </div>
          
          {/* Coluna direita - Em Destaque (1/4) - Alinhada com menu */}
          <div className="w-full lg:w-1/4 lg:pl-6">
            <h2 className="text-2xl font-bold mb-4 border-b border-gray-200 pb-4">Em Destaque</h2>
            <Featured />
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NewsItem {
  title: string;
  slug?: string;
}

interface BreakingNewsTickerClientProps {
  news: NewsItem[];
}

export default function BreakingNewsTickerClient({ news }: BreakingNewsTickerClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const newsItems = news;

  // Auto rotation
  useEffect(() => {
    if (newsItems.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % newsItems.length);
      }, 5000); // Change every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [newsItems.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + newsItems.length) % newsItems.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % newsItems.length);
  };

  const currentNews = newsItems[currentIndex] || newsItems[0];

  return (
    <div className="bg-red-600 text-white py-3 px-4">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <span className="bg-white text-red-600 px-3 py-1 text-sm font-bold rounded animate-pulse">
            ÚLTIMAS
          </span>
          
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center space-x-4">
              {currentNews.slug ? (
                <Link 
                  href={`/post/${currentNews.slug}`}
                  className="text-white hover:text-gray-200 transition-colors truncate"
                >
                  <span className="inline-block animate-marquee whitespace-nowrap">
                    {currentNews.title}
                  </span>
                </Link>
              ) : (
                <span className="inline-block animate-marquee whitespace-nowrap">
                  {currentNews.title}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handlePrevious}
            className="text-white hover:text-gray-200 transition-colors p-1"
            aria-label="Previous news"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div className="flex space-x-1">
            {newsItems.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={handleNext}
            className="text-white hover:text-gray-200 transition-colors p-1"
            aria-label="Next news"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
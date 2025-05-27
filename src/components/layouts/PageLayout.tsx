'use client';

import React from 'react';
import NewsHeader from '@/components/sections/NewsHeader';
import CryptoBasicFooter from '@/components/sections/CryptoBasicFooter';

interface PageLayoutProps {
  children: React.ReactNode;
  showBreakingNews?: boolean;
  className?: string;
}

export default function PageLayout({ 
  children, 
  showBreakingNews = false,
  className = ''
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      <NewsHeader />
      
      <main className="flex-1 pt-[70px]">
        {children}
      </main>
      
      <CryptoBasicFooter />
    </div>
  );
}
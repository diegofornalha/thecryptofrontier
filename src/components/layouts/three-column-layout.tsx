'use client';

import React from 'react';
import NewsHeader from '@/components/sections/NewsHeader';
import CryptoBasicFooter from '@/components/sections/CryptoBasicFooter';
import BreakingNewsTicker from '@/components/sections/home/BreakingNewsTicker';

interface ThreeColumnLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  title: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
}

export default function ThreeColumnLayout({
  children,
  sidebar,
  title,
  breadcrumbs = [],
}: ThreeColumnLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <NewsHeader />
      
      {/* Layout padrão The Crypto Basic */}
      <div className="pt-[70px]">
        {/* Breaking News Ticker */}
        <BreakingNewsTicker />
        
        {/* Breadcrumb */}
        <div className="border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <a href="/" className="hover:text-[#4db2ec] transition-colors">Home</a>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <span className="text-gray-400">›</span>
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-[#4db2ec] transition-colors">
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-gray-900">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>
        </div>

        {/* Header */}
        <div className="py-8 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-[#111]">{title}</h1>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Content Area (8 cols) */}
          <div className="lg:col-span-8">
            {children}
          </div>

          {/* Sidebar (4 cols) */}
          {sidebar && (
            <aside className="lg:col-span-4">
              {sidebar}
            </aside>
          )}
        </div>
      </main>
      
      <CryptoBasicFooter />
    </div>
  );
}
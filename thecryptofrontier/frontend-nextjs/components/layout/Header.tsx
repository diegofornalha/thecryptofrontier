"use client";

import React from 'react';
import Link from 'next/link';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16">
          {/* Título Centralizado */}
          <div className="flex justify-center">
            <Link href="/" className="text-3xl font-bold text-gray-900 font-serif hover:text-blue-600 transition-colors">
              The Crypto Frontier
            </Link>
          </div>

          {/* Language Switcher na direita */}
          <div className="absolute right-4">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
} 
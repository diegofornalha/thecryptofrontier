"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  {
    code: 'br',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸'
  }
];

const locales = languages.map(l => l.code);

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState('en');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const localeFromPath = pathSegments[0];

    if (locales.includes(localeFromPath)) {
      setCurrentLocale(localeFromPath);
    } else {
      setCurrentLocale('en');
    }
  }, [pathname]);

  const currentLanguage = languages.find(lang => lang.code === currentLocale) ?? languages[0];

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleLanguageChange = (newLanguage: Language) => {
    // Salvar preferência no cookie
    if (typeof window !== 'undefined') {
      document.cookie = `preferredLanguage=${newLanguage.code}; path=/; max-age=31536000; SameSite=Lax`; // 1 year
    }

    // Detectar o locale atual no pathname
    const pathSegments = pathname.split('/').filter(Boolean);
    const currentLocaleFromPath = pathSegments[0] || '';

    // Remover o locale atual do pathname para obter o caminho base
    let basePath = pathname;
    if (locales.includes(currentLocaleFromPath)) {
        // Remove o locale do início do pathname
        basePath = pathname.replace(`/${currentLocaleFromPath}`, '');
    }
    
    // Se o basePath ficar vazio, significa que era apenas o locale, então deve ser '/'
    if (basePath === '' || basePath === '/') {
        basePath = '/';
    }

    // Construir a nova URL
    let newPath;
    if (basePath === '/') {
        // Se estamos na home page, redirecionar idiomas não-inglês para /post
    if (newLanguage.code === 'en') {
            newPath = `/en`;
        } else {
            newPath = `/${newLanguage.code}/post`;
        }
    } else {
        // Para outras páginas, manter o mesmo caminho mas trocar o locale
        newPath = `/${newLanguage.code}${basePath}`;
    }

    // Garantir que o path seja válido
    if (newPath.startsWith('//')) {
        newPath = newPath.substring(1);
    }

    // Redirecionar para a nova URL
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do seletor */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 
                   bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-sm transition-all duration-200
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Selecionar idioma"
      >
        <span className="text-lg leading-none" style={{ fontSize: '16px' }}>
          {currentLanguage.flag}
        </span>
        <span className="hidden sm:inline-block">
          {currentLanguage.nativeName}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm text-left transition-colors duration-150
                           hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
                           ${language.code === currentLocale ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                role="menuitem"
              >
                <span className="text-lg leading-none flex-shrink-0" style={{ fontSize: '16px' }}>
                  {language.flag}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {language.nativeName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {language.name}
                  </div>
                </div>
                {language.code === currentLocale && (
                  <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
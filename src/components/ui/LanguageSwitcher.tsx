'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('pt');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detectar idioma atual da URL
  useEffect(() => {
    const pathSegments = pathname.split('/');
    const langCode = pathSegments[1];
    if (languages.some(lang => lang.code === langCode)) {
      setCurrentLang(langCode);
    } else {
      setCurrentLang('pt'); // Padrão para português
    }
  }, [pathname]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode: string) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }

    // Construir nova URL com o idioma selecionado
    const pathSegments = pathname.split('/');
    const hasLangInPath = languages.some(lang => lang.code === pathSegments[1]);
    
    let newPath = '';
    if (hasLangInPath) {
      // Substituir idioma existente
      pathSegments[1] = langCode;
      newPath = pathSegments.join('/');
    } else {
      // Adicionar idioma à URL
      newPath = `/${langCode}${pathname}`;
    }

    // Salvar preferência no localStorage
    localStorage.setItem('preferredLanguage', langCode);
    
    // Navegar para a nova URL
    router.push(newPath);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Selecionar idioma"
      >
        <span className="text-xl">{currentLanguage.flag}</span>
        <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentLanguage.name}
        </span>
        <ChevronDown 
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-1 z-50">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                language.code === currentLang 
                  ? 'bg-gray-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="font-medium">{language.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
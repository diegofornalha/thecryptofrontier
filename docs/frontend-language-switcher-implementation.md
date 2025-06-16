# Implementação do Language Switcher no Frontend

## 1. Componente Language Switcher

### components/LanguageSwitcher.tsx
```tsx
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface Language {
  code: string
  name: string
  flag: string
}

const languages: Language[] = [
  { code: 'br', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const { locale, asPath, pathname, query } = router
  const [isOpen, setIsOpen] = useState(false)
  
  const currentLang = languages.find(lang => lang.code === locale) || languages[0]
  
  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false)
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])
  
  const handleLanguageChange = (langCode: string) => {
    // Salvar preferência no localStorage
    localStorage.setItem('preferred-language', langCode)
    
    // Se estiver em uma página de post, precisa buscar o slug traduzido
    if (pathname.includes('/posts/[slug]')) {
      fetchTranslatedSlug(query.slug as string, langCode)
    } else {
      // Para outras páginas, apenas muda o locale
      router.push(asPath, asPath, { locale: langCode })
    }
    
    setIsOpen(false)
  }
  
  const fetchTranslatedSlug = async (currentSlug: string, targetLocale: string) => {
    try {
      // Buscar o post atual para pegar o documentId
      const currentPost = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts?filters[slug][$eq]=${currentSlug}&locale=${locale}`
      ).then(res => res.json())
      
      if (currentPost.data?.[0]) {
        const documentId = currentPost.data[0].documentId
        
        // Buscar a versão no idioma desejado
        const translatedPost = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/posts/${documentId}?locale=${targetLocale}`
        ).then(res => res.json())
        
        if (translatedPost.data) {
          // Redirecionar para o slug traduzido
          router.push(
            `/posts/${translatedPost.data.slug}`,
            `/posts/${translatedPost.data.slug}`,
            { locale: targetLocale }
          )
        } else {
          // Se não houver tradução, vai para a home no novo idioma
          router.push('/', '/', { locale: targetLocale })
        }
      }
    } catch (error) {
      console.error('Error fetching translated content:', error)
      router.push('/', '/', { locale: targetLocale })
    }
  }
  
  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <span className="text-lg">{currentLang.flag}</span>
        <span>{currentLang.name}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 origin-top-right bg-white rounded-md shadow-lg w-48 ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`
                  flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100
                  ${lang.code === locale ? 'bg-gray-50 text-indigo-600' : 'text-gray-700'}
                `}
              >
                <span className="mr-3 text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

## 2. Configuração do Next.js

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    defaultLocale: 'br',
    locales: ['br', 'en', 'es'],
    localeDetection: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/br',
        locale: false,
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
```

## 3. Hook Personalizado para Traduções

### hooks/useTranslations.ts
```typescript
import { useRouter } from 'next/router'
import br from '../locales/br.json'
import en from '../locales/en.json'
import es from '../locales/es.json'

const translations = { br, en, es }

export function useTranslations() {
  const { locale } = useRouter()
  const t = translations[locale as keyof typeof translations] || translations.br
  
  return {
    t,
    locale,
  }
}
```

### locales/br.json
```json
{
  "nav": {
    "home": "Início",
    "about": "Sobre",
    "blog": "Blog",
    "contact": "Contato"
  },
  "common": {
    "readMore": "Ler mais",
    "share": "Compartilhar",
    "loading": "Carregando...",
    "error": "Erro ao carregar conteúdo"
  },
  "blog": {
    "latestPosts": "Últimos Posts",
    "categories": "Categorias",
    "searchPlaceholder": "Buscar artigos...",
    "noResults": "Nenhum resultado encontrado"
  }
}
```

### locales/en.json
```json
{
  "nav": {
    "home": "Home",
    "about": "About",
    "blog": "Blog",
    "contact": "Contact"
  },
  "common": {
    "readMore": "Read more",
    "share": "Share",
    "loading": "Loading...",
    "error": "Error loading content"
  },
  "blog": {
    "latestPosts": "Latest Posts",
    "categories": "Categories",
    "searchPlaceholder": "Search articles...",
    "noResults": "No results found"
  }
}
```

## 4. Middleware para Detecção e Redirecionamento

### middleware.ts
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['br', 'en', 'es']
const defaultLocale = 'br'

function getLocale(request: NextRequest): string {
  // 1. Verificar preferência salva no cookie
  const cookieLocale = request.cookies.get('preferred-language')?.value
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale
  }
  
  // 2. Verificar Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language') || ''
  const detectedLocale = acceptLanguage
    .split(',')
    .map(lang => {
      const [code] = lang.trim().split('-')
      return code.toLowerCase()
    })
    .find(code => {
      if (code === 'pt') return 'br' // Mapear pt para br
      return locales.includes(code)
    })
  
  return detectedLocale || defaultLocale
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Verificar se já tem locale na URL
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  if (!pathnameHasLocale) {
    const locale = getLocale(request)
    const newUrl = new URL(`/${locale}${pathname}`, request.url)
    
    // Adicionar cookie para lembrar preferência
    const response = NextResponse.redirect(newUrl)
    response.cookies.set('preferred-language', locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 ano
      sameSite: 'lax',
    })
    
    return response
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
```

## 5. Páginas com Suporte a i18n

### pages/[locale]/index.tsx
```tsx
import { GetStaticProps, GetStaticPaths } from 'next'
import { useTranslations } from '@/hooks/useTranslations'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default function Home({ posts }: { posts: any[] }) {
  const { t } = useTranslations()
  
  return (
    <div>
      <header className="flex justify-between items-center p-4">
        <h1>{t.nav.home}</h1>
        <LanguageSwitcher />
      </header>
      
      <main>
        <h2>{t.blog.latestPosts}</h2>
        {/* Renderizar posts */}
      </main>
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const locales = ['br', 'en', 'es']
  
  return {
    paths: locales.map(locale => ({ params: { locale } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const locale = params?.locale as string
  
  // Buscar posts no idioma correto
  const res = await fetch(
    `${process.env.STRAPI_URL}/api/posts?locale=${locale}&populate=*`
  )
  const data = await res.json()
  
  return {
    props: {
      posts: data.data || [],
    },
    revalidate: 60, // ISR - revalidar a cada minuto
  }
}
```

## 6. SEO com Tags Hreflang

### components/SEO.tsx
```tsx
import Head from 'next/head'
import { useRouter } from 'next/router'

interface SEOProps {
  title: string
  description: string
  article?: {
    publishedTime?: string
    modifiedTime?: string
    author?: string
    tags?: string[]
  }
  alternates?: {
    locale: string
    slug: string
  }[]
}

export default function SEO({ title, description, article, alternates }: SEOProps) {
  const router = useRouter()
  const { locale, asPath } = router
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thecryptofrontier.com'
  
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={`${baseUrl}/${locale}${asPath}`} />
      <meta property="og:locale" content={locale === 'br' ? 'pt_BR' : locale} />
      
      {/* Canonical */}
      <link rel="canonical" href={`${baseUrl}/${locale}${asPath}`} />
      
      {/* Hreflang tags */}
      {alternates && alternates.map(alt => (
        <link
          key={alt.locale}
          rel="alternate"
          hreflang={alt.locale === 'br' ? 'pt-BR' : alt.locale}
          href={`${baseUrl}/${alt.locale}/${alt.slug}`}
        />
      ))}
      
      {/* x-default para fallback */}
      <link
        rel="alternate"
        hreflang="x-default"
        href={`${baseUrl}/br${asPath}`}
      />
      
      {/* Article specific */}
      {article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
          {article.tags && article.tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
    </Head>
  )
}
```

## 7. Função Helper para URLs Localizadas

### lib/urls.ts
```typescript
export function getLocalizedUrl(
  path: string,
  locale: string,
  includeBase: boolean = false
): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  const localizedPath = `/${locale}${path.startsWith('/') ? path : `/${path}`}`
  
  return includeBase ? `${baseUrl}${localizedPath}` : localizedPath
}

export function removeLocaleFromPath(path: string): string {
  const locales = ['br', 'en', 'es']
  const segments = path.split('/')
  
  if (locales.includes(segments[1])) {
    segments.splice(1, 1)
    return segments.join('/') || '/'
  }
  
  return path
}
```

## 8. Persistência de Preferência

### hooks/useLanguagePreference.ts
```typescript
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export function useLanguagePreference() {
  const router = useRouter()
  
  useEffect(() => {
    // Verificar preferência salva
    const savedLocale = localStorage.getItem('preferred-language')
    
    if (savedLocale && savedLocale !== router.locale) {
      // Redirecionar para idioma preferido
      router.push(router.asPath, router.asPath, { locale: savedLocale })
    }
  }, [])
  
  const setLanguagePreference = (locale: string) => {
    localStorage.setItem('preferred-language', locale)
    document.cookie = `preferred-language=${locale};max-age=31536000;path=/`
  }
  
  return { setLanguagePreference }
}
```

## 9. Loading State para Troca de Idioma

### components/LanguageLoadingOverlay.tsx
```tsx
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

export default function LanguageLoadingOverlay() {
  const router = useRouter()
  const [isChangingLanguage, setIsChangingLanguage] = useState(false)
  
  useEffect(() => {
    const handleStart = (url: string) => {
      // Detectar se está mudando de idioma
      const currentLocale = router.locale
      const urlLocale = url.split('/')[1]
      
      if (['br', 'en', 'es'].includes(urlLocale) && urlLocale !== currentLocale) {
        setIsChangingLanguage(true)
      }
    }
    
    const handleComplete = () => {
      setIsChangingLanguage(false)
    }
    
    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)
    
    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
    }
  }, [router])
  
  if (!isChangingLanguage) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="text-lg">Changing language...</span>
      </div>
    </div>
  )
}
```

## Implementação Passo a Passo

1. **Instalar dependências**
   ```bash
   npm install @heroicons/react
   ```

2. **Adicionar LanguageSwitcher ao layout**
   ```tsx
   // components/Layout.tsx
   <header>
     <nav>
       {/* ... outros itens do menu */}
       <LanguageSwitcher />
     </nav>
   </header>
   ```

3. **Configurar variáveis de ambiente**
   ```env
   NEXT_PUBLIC_STRAPI_URL=https://ale-blog.agentesintegrados.com
   NEXT_PUBLIC_SITE_URL=https://thecryptofrontier.com
   ```

4. **Testar redirecionamentos**
   - Acessar `/` deve redirecionar para `/br`
   - Trocar idioma deve manter a página atual
   - Posts devem buscar slug traduzido

5. **Verificar SEO**
   - Tags hreflang corretas
   - URLs canônicas por idioma
   - Sitemap com todas as versões
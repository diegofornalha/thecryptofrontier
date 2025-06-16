# Configuração i18n para o Frontend Next.js

## Estrutura Recomendada: Subdiretórios

```
thecryptofrontier.com/br/artigo-titulo
thecryptofrontier.com/en/article-title
thecryptofrontier.com/es/articulo-titulo
```

## 1. Configuração do Next.js

### next.config.js
```javascript
module.exports = {
  i18n: {
    defaultLocale: 'br',
    locales: ['br', 'en', 'es'],
    localeDetection: true, // Auto-detecta idioma do usuário
  },
}
```

## 2. Estrutura de Arquivos

```
/pages
  /[locale]
    /index.js          → Homepage
    /posts
      /[slug].js       → Artigos dinâmicos
  /api
    /posts
      /[locale].js     → API por idioma
```

## 3. Componente de Troca de Idioma

```jsx
// components/LanguageSwitcher.js
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function LanguageSwitcher() {
  const router = useRouter()
  const { locale, locales, asPath } = router

  return (
    <div className="language-switcher">
      {locales.map((lng) => (
        <Link 
          key={lng} 
          href={asPath} 
          locale={lng}
          className={locale === lng ? 'active' : ''}
        >
          {lng.toUpperCase()}
        </Link>
      ))}
    </div>
  )
}
```

## 4. Fetch de Conteúdo por Idioma

```javascript
// lib/api.js
export async function getPostBySlug(slug, locale = 'pt') {
  const res = await fetch(
    `${STRAPI_URL}/api/posts?filters[slug][$eq]=${slug}&locale=${locale}`
  )
  const data = await res.json()
  return data.data[0]
}

// Buscar todas as versões de idioma
export async function getPostLocales(documentId) {
  const res = await fetch(
    `${STRAPI_URL}/api/posts/${documentId}?locale=all`
  )
  const data = await res.json()
  return data.data
}
```

## 5. SEO com Hreflang

```jsx
// components/SEO.js
import Head from 'next/head'

export default function SEO({ post, locale, alternates }) {
  return (
    <Head>
      <title>{post.seo.metaTitle}</title>
      <meta name="description" content={post.seo.metaDescription} />
      
      {/* Canonical */}
      <link 
        rel="canonical" 
        href={`https://thecryptofrontier.com/${locale}/${post.slug}`} 
      />
      
      {/* Hreflang para Google */}
      {alternates.map(alt => (
        <link
          key={alt.locale}
          rel="alternate"
          hreflang={alt.locale}
          href={`https://thecryptofrontier.com/${alt.locale}/${alt.slug}`}
        />
      ))}
      
      {/* Default */}
      <link
        rel="alternate"
        hreflang="x-default"
        href={`https://thecryptofrontier.com/pt/${post.slug}`}
      />
    </Head>
  )
}
```

## 6. Middleware para Redirecionamento

```javascript
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  const pathname = request.nextUrl.pathname
  
  // Verifica se já tem locale na URL
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  if (!pathnameHasLocale) {
    // Detecta idioma preferido
    const locale = getLocale(request)
    
    // Redireciona para versão com locale
    const newUrl = new URL(`/${locale}${pathname}`, request.url)
    return NextResponse.redirect(newUrl)
  }
}

export const config = {
  matcher: ['/((?!api|_next|static|favicon.ico).*)']
}
```

## 7. Otimizações Recomendadas

### Static Generation com Locales
```javascript
// pages/[locale]/posts/[slug].js
export async function getStaticPaths() {
  const posts = await getAllPosts()
  const paths = []
  
  for (const post of posts) {
    for (const locale of locales) {
      paths.push({
        params: { slug: post.slug, locale },
      })
    }
  }
  
  return { paths, fallback: 'blocking' }
}
```

### Cache por Idioma
```javascript
// Adicionar no next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:locale/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=59',
          },
        ],
      },
    ]
  },
}
```

## 8. Analytics por Idioma

```javascript
// components/Analytics.js
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Analytics() {
  const { locale, asPath } = useRouter()
  
  useEffect(() => {
    // Google Analytics
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: `/${locale}${asPath}`,
        page_locale: locale,
      })
    }
  }, [locale, asPath])
  
  return null
}
```

## Vantagens desta Abordagem

1. **SEO Unificado**: Todo o link juice permanece em um domínio
2. **Fácil Manutenção**: Um único deployment
3. **Performance**: SSG/ISR funciona perfeitamente
4. **UX**: Troca de idioma instantânea
5. **Analytics**: Fácil comparar métricas entre idiomas

## Implementação no Netlify

```toml
# netlify.toml
[[redirects]]
  from = "/"
  to = "/pt"
  status = 301
  conditions = {Language = ["pt"]}

[[redirects]]
  from = "/"
  to = "/en"
  status = 301
  conditions = {Language = ["en"]}

[[redirects]]
  from = "/"
  to = "/es"
  status = 301
  conditions = {Language = ["es"]}
```

## Checklist de Implementação

- [ ] Configurar i18n no next.config.js
- [ ] Criar estrutura de pastas com [locale]
- [ ] Implementar LanguageSwitcher
- [ ] Adicionar tags hreflang para SEO
- [ ] Configurar middleware de redirecionamento
- [ ] Testar com Google Search Console
- [ ] Configurar analytics por idioma
- [ ] Adicionar traduções de UI (botões, menus)
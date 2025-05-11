"use client"

import React from 'react'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'

// Componente para demonstrar a migração do Layout principal
export function LayoutMigration() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Atual (Layout legado)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* Versão simplificada do DefaultBaseLayout atual */}
          <div className="sb-page">
            <div className="sb-base sb-default-base-layout">
              {/* Header simplificado */}
              <header className="bg-white shadow-md p-4 z-50 relative">
                <div className="mx-auto max-w-7xl">
                  <div className="relative flex items-center">
                    <div className="mr-10">
                      <a href="/" className="flex items-center">
                        <span className="text-xl font-bold">The Crypto Frontier</span>
                      </a>
                    </div>
                  </div>
                </div>
              </header>
              
              {/* Conteúdo principal */}
              <main id="main" className="sb-layout sb-page-layout">
                <div className="bg-gray-100 p-8">
                  <div className="mx-auto max-w-7xl">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <h1 className="text-2xl font-bold mb-4">Exemplo de Conteúdo</h1>
                      <p className="text-gray-700 mb-4">
                        Este é um exemplo simplificado do layout atual. O layout base é responsável 
                        por renderizar o header, o conteúdo principal (children) e o footer.
                      </p>
                      <div className="border p-4 rounded-md bg-gray-50">
                        <p className="font-medium">Seção de Conteúdo</p>
                        <p className="text-sm text-gray-600">
                          As seções de conteúdo são renderizadas dentro do layout principal.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
              
              {/* Footer simplificado */}
              <footer className="bg-gray-50 px-4 py-16">
                <div className="mx-auto max-w-7xl">
                  <div className="text-center text-gray-600">
                    <p className="text-sm">© 2023 The Crypto Frontier</p>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// DefaultBaseLayout
export default function DefaultBaseLayout(props) {
  const { page, site } = props;
  const { enableAnnotations = true } = site;
  const pageMeta = page?.__metadata || {};

  return (
    <div className={classNames('sb-page', pageMeta.pageCssClasses)} 
      {...(enableAnnotations && { 'data-sb-object-id': pageMeta.id })}>
      <div className="sb-base sb-default-base-layout">
        {site.header && <Header {...site.header} enableAnnotations={enableAnnotations} />}
        {props.children}
        {site.footer && <Footer {...site.footer} enableAnnotations={enableAnnotations} />}
      </div>
    </div>
  );
}

// PageLayout
export default function PageLayout(props) {
  const { page, site } = props;
  const BaseLayout = getBaseLayoutComponent(page.baseLayout, site.baseLayout);
  const { enableAnnotations = true } = site;
  const { title, sections = [] } = page;

  return (
    <BaseLayout page={page} site={site}>
      <main id="main" className="sb-layout sb-page-layout">
        {title && (
          <h1 className="sr-only">{title}</h1>
        )}
        {sections.length > 0 && (
          <div>
            {sections.map((section, index) => {
              const Component = getComponent(section.__metadata.modelName);
              if (!Component) {
                throw new Error(
                  \`no component matching the page section's model name: \${section.__metadata.modelName}\`
                );
              }
              return (
                <Component
                  key={index}
                  {...section}
                  enableAnnotations={enableAnnotations}
                />
              );
            })}
          </div>
        )}
      </main>
    </BaseLayout>
  );
}`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Migrado (shadcn/ui)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* Layout migrado usando componentes shadcn/ui */}
          <div className="min-h-screen flex flex-col bg-background">
            {/* Header simplificado */}
            <header className="border-b">
              <Container>
                <div className="flex h-16 items-center justify-between">
                  <Link href="/" className="font-bold">
                    The Crypto Frontier
                  </Link>
                </div>
              </Container>
            </header>
            
            {/* Conteúdo principal */}
            <main id="main" className="flex-1">
              <Container className="py-10">
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                  <h1 className="text-2xl font-bold mb-4">Exemplo de Conteúdo</h1>
                  <p className="text-muted-foreground mb-4">
                    Este é um exemplo simplificado do layout migrado. O layout principal agora usa 
                    componentes e tokens do design system shadcn/ui.
                  </p>
                  <div className="border p-4 rounded-md bg-muted">
                    <p className="font-medium">Seção de Conteúdo</p>
                    <p className="text-sm text-muted-foreground">
                      As seções de conteúdo são renderizadas com componentes shadcn/ui.
                    </p>
                  </div>
                </div>
              </Container>
            </main>
            
            {/* Footer simplificado */}
            <footer className="border-t py-6">
              <Container>
                <div className="text-center text-sm text-muted-foreground">
                  <p>© 2023 The Crypto Frontier</p>
                </div>
              </Container>
            </footer>
          </div>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// RootLayout usando shadcn/ui
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head />
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen flex flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
}

// PageLayout usando shadcn/ui
export default function PageLayout({ 
  children,
  sections = []
}: PageLayoutProps) {
  return (
    <>
      {sections?.length > 0 && (
        <div>
          {sections.map((section, index) => {
            // Renderizar seções usando componentes modernos
            const SectionComponent = getSectionComponent(section.type);
            return <SectionComponent key={index} {...section} />;
          })}
        </div>
      )}
      {children}
    </>
  );
}`}</code>
        </pre>
      </div>

      <div className="p-4 border border-dashed rounded-md">
        <h3 className="text-lg font-medium mb-4">Guia de Migração</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li>Migrar para App Router do Next.js com RootLayout como layout principal</li>
          <li>Substituir as classes customizadas <code>sb-*</code> por classes utilitárias do Tailwind</li>
          <li>Usar <code>Container</code> para padronizar o layout de todas as páginas</li>
          <li>Aplicar flex-col e flex-1 no layout principal para garantir que o footer fique na parte inferior</li>
          <li>Usar tokens do design system em vez de valores hardcoded (text-muted-foreground, bg-background, etc.)</li>
          <li>Implementar <code>ThemeProvider</code> para suporte a temas claro/escuro</li>
          <li>Simplificar a renderização de seções com componentes mais modernos</li>
          <li>Usar border utilities em vez de shadow-* para separações visuais mais sutis</li>
          <li>Adicionar metadata para melhorar SEO e acessibilidade</li>
        </ul>
        
        <div className="mt-4">
          <h4 className="font-medium mb-2">Benefícios da migração:</h4>
          <ul className="space-y-1 list-disc pl-5">
            <li>Melhor desempenho com App Router e componentes otimizados</li>
            <li>Suporte nativo a temas claro/escuro</li>
            <li>Consistência visual em todo o site</li>
            <li>Código mais limpo e mais fácil de manter</li>
            <li>Melhor acessibilidade em todos os componentes</li>
            <li>Melhor compatibilidade com diferentes tamanhos de tela</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 
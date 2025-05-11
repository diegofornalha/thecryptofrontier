"use client"

import React from 'react'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

// Componente para demonstrar a migração do Layout de Feed de Posts
export function PostFeedLayoutMigration() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Atual (PostFeedLayout legado)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* Versão simplificada do PostFeedLayout atual */}
          <main className="pb-12">
            <div className="w-full mb-9">
              <div className="border rounded px-4 py-2 focus-within:border-primary">
                <input 
                  type="search"
                  placeholder="Buscar artigos..."
                  className="w-full outline-none bg-transparent"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Posts simulados */}
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="p-4">
                    <h3 className="font-bold mb-2">
                      <a href="#" className="hover:text-blue-600">Artigo sobre criptomoedas #{i}</a>
                    </h3>
                    <p className="text-sm mb-3">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                    <p className="text-sm text-gray-600">2023-06-{i < 10 ? '0' + i : i}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Paginação */}
            <div className="flex flex-row flex-wrap items-center gap-2 mt-12">
              <a href="#" className="w-10 h-10 p-0 text-sm flex items-center justify-center border rounded-md shrink-0 opacity-25 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 p-0 text-sm flex items-center justify-center border rounded-md bg-primary text-white shrink-0">1</a>
              <a href="#" className="w-10 h-10 p-0 text-sm flex items-center justify-center border rounded-md shrink-0">2</a>
              <a href="#" className="w-10 h-10 p-0 text-sm flex items-center justify-center border rounded-md shrink-0">3</a>
              <span className="p-1 text-2xl">&hellip;</span>
              <a href="#" className="w-10 h-10 p-0 text-sm flex items-center justify-center border rounded-md shrink-0">10</a>
              <a href="#" className="w-10 h-10 p-0 text-sm flex items-center justify-center border rounded-md shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
            </div>
          </main>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// PostFeedLayout atual
export default function PostFeedLayout(props) {
  const { page, site } = props;
  const BaseLayout = getBaseLayoutComponent(page.baseLayout, site.baseLayout);
  const { enableAnnotations = true } = site;
  const { title, topSections = [], bottomSections = [], pageIndex, baseUrlPath, numOfPages, enableSearch, items, postFeed } = page;
  const PostFeedSection = getComponent('PostFeedSection');
  const pageLinks = PageLinks({ pageIndex, baseUrlPath, numOfPages });
  const searchBox = SearchBox({ enableSearch });

  return (
    <BaseLayout page={page} site={site}>
      <main id="main" className="sb-layout sb-page-layout">
        {title && (
          <h1 className="sr-only" {...(enableAnnotations && { 'data-sb-field-path': 'title' })}>
            {title}
          </h1>
        )}
        {renderSections(topSections, 'topSections', enableAnnotations)}
        <PostFeedSection
          {...postFeed}
          posts={items}
          pageLinks={pageLinks}
          searchBox={searchBox}
          enableAnnotations={enableAnnotations}
          {...(enableAnnotations && { 'data-sb-field-path': 'postFeed' })}
        />
        {renderSections(bottomSections, 'bottomSections', enableAnnotations)}
      </main>
    </BaseLayout>
  );
}

// Função PageLinks que gera a paginação
function PageLinks({ pageIndex, baseUrlPath, numOfPages }) {
  if (numOfPages < 2) {
    return null;
  }
  const pageLinks = [];
  const padRange = 2;
  const startIndex = pageIndex - padRange > 2 ? pageIndex - padRange : 0;
  const endIndex = pageIndex + padRange < numOfPages - 3 ? pageIndex + padRange : numOfPages - 1;

  // Botão anterior (prev)
  if (pageIndex > 0) {
    pageLinks.push(
      <PageLink key="prev" pageIndex={pageIndex - 1} baseUrlPath={baseUrlPath}>
        <ChevronLeftIcon className="w-6 h-6 fill-current" />
      </PageLink>
    );
  } else {
    pageLinks.push(
      <PageLinkDisabled key="prev">
        <ChevronLeftIcon className="w-6 h-6 fill-current" />
      </PageLinkDisabled>
    );
  }

  // Renderiza primeira página e ellipsis se necessário
  if (startIndex > 0) {
    pageLinks.push(
      <PageLink key="0" pageIndex={0} baseUrlPath={baseUrlPath}>1</PageLink>
    );
    if (startIndex > 1) {
      pageLinks.push(<Ellipsis key="beforeEllipsis" />);
    }
  }

  // Renderiza as páginas entre startIndex e endIndex
  for (let i = startIndex; i <= endIndex; i++) {
    if (pageIndex === i) {
      pageLinks.push(<PageLinkDisabled key={i}>{i + 1}</PageLinkDisabled>);
    } else {
      pageLinks.push(
        <PageLink key={i} pageIndex={i} baseUrlPath={baseUrlPath}>{i + 1}</PageLink>
      );
    }
  }

  // Renderiza última página e ellipsis se necessário
  if (endIndex < numOfPages - 1) {
    if (endIndex < numOfPages - 2) {
      pageLinks.push(<Ellipsis key="afterEllipsis" />);
    }
    pageLinks.push(
      <PageLink key={numOfPages - 1} pageIndex={numOfPages - 1} baseUrlPath={baseUrlPath}>
        {numOfPages}
      </PageLink>
    );
  }

  // Botão próximo (next)
  if (pageIndex < numOfPages - 1) {
    pageLinks.push(
      <PageLink key="next" pageIndex={pageIndex + 1} baseUrlPath={baseUrlPath}>
        <ChevronRightIcon className="w-6 h-6 fill-current" />
      </PageLink>
    );
  } else {
    pageLinks.push(
      <PageLinkDisabled key="next">
        <ChevronRightIcon className="w-6 h-6 fill-current" />
      </PageLinkDisabled>
    );
  }

  return <div className="flex flex-row flex-wrap items-center gap-2 mt-12 sm:mt-20">{pageLinks}</div>;
}`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Migrado (shadcn/ui)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* Layout de feed de posts migrado usando componentes shadcn/ui */}
          <Container>
            <main className="py-12">
              {/* Campo de busca migrado */}
              <div className="w-full mb-9">
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="search"
                    placeholder="Buscar artigos..."
                    className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
              
              {/* Grid de posts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Posts simulados usando Card do shadcn/ui */}
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 space-y-3">
                      <h3 className="text-lg font-semibold">
                        <Link href="#" className="hover:underline">Artigo sobre criptomoedas #{i}</Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                      </p>
                      <p className="text-sm text-muted-foreground">2023-06-{i < 10 ? '0' + i : i}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Paginação migrada */}
              <nav className="flex items-center justify-center gap-1 mt-12" aria-label="Paginação">
                <Button variant="outline" size="icon" disabled className="h-9 w-9 p-0">
                  <span className="sr-only">Página anterior</span>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0 bg-primary text-primary-foreground hover:bg-primary/90">
                  <span>1</span>
                </Button>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                  <span>2</span>
                </Button>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                  <span>3</span>
                </Button>
                <span className="p-1 text-muted-foreground">&hellip;</span>
                <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                  <span>10</span>
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 p-0">
                  <span className="sr-only">Próxima página</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </main>
          </Container>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// PostFeedLayout migrado usando shadcn/ui
export function PostFeedLayout({
  title,
  topSections = [],
  bottomSections = [],
  pageIndex = 0,
  baseUrlPath = '/',
  numOfPages = 1,
  enableSearch = false,
  items = [],
  className,
  ...props
}) {
  return (
    <div className={cn("", className)} {...props}>
      <Container>
        <main className="py-12">
          {title && (
            <h1 className="sr-only">{title}</h1>
          )}
          
          {/* Renderiza topSections */}
          {topSections.length > 0 && (
            <div className="mb-8">
              {topSections.map((section, index) => (
                <section key={index} className="mb-6">
                  {/* Componente de seção baseado no tipo */}
                </section>
              ))}
            </div>
          )}
          
          {/* Campo de busca */}
          {enableSearch && (
            <div className="w-full mb-9">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar artigos..."
                  className="w-full pl-10"
                />
              </div>
            </div>
          )}
          
          {/* Grid de posts */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((post, i) => (
              <Card key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <CardContent className="p-6 space-y-3">
                  <h3 className="text-lg font-semibold">
                    <Link href={post.url} className="hover:underline">{post.title}</Link>
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                  )}
                  {post.date && (
                    <p className="text-sm text-muted-foreground">{formatDate(post.date)}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Paginação */}
          {numOfPages > 1 && (
            <Pagination pageIndex={pageIndex} baseUrlPath={baseUrlPath} numOfPages={numOfPages} />
          )}
          
          {/* Renderiza bottomSections */}
          {bottomSections.length > 0 && (
            <div className="mt-12">
              {bottomSections.map((section, index) => (
                <section key={index} className="mb-6">
                  {/* Componente de seção baseado no tipo */}
                </section>
              ))}
            </div>
          )}
        </main>
      </Container>
    </div>
  );
}

// Componente de paginação
function Pagination({ pageIndex, baseUrlPath, numOfPages }) {
  const padRange = 2;
  const startIndex = pageIndex - padRange > 2 ? pageIndex - padRange : 0;
  const endIndex = pageIndex + padRange < numOfPages - 3 ? pageIndex + padRange : numOfPages - 1;
  
  return (
    <nav className="flex items-center justify-center gap-1 mt-12" aria-label="Paginação">
      {/* Botão anterior */}
      {pageIndex > 0 ? (
        <Button 
          variant="outline" 
          size="icon" 
          asChild 
          className="h-9 w-9 p-0"
        >
          <Link href={urlForPage(pageIndex - 1, baseUrlPath)}>
            <span className="sr-only">Página anterior</span>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" disabled className="h-9 w-9 p-0">
          <span className="sr-only">Página anterior</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      
      {/* Primeira página e ellipsis */}
      {startIndex > 0 && (
        <>
          <Button variant="outline" size="sm" asChild className="h-9 w-9 p-0">
            <Link href={urlForPage(0, baseUrlPath)}>1</Link>
          </Button>
          {startIndex > 1 && <span className="p-1 text-muted-foreground">&hellip;</span>}
        </>
      )}
      
      {/* Páginas do meio */}
      {Array.from({ length: endIndex - startIndex + 1 }, (_, i) => startIndex + i).map((i) => (
        <Button 
          key={i}
          variant="outline" 
          size="sm"
          asChild={pageIndex !== i}
          className={cn(
            "h-9 w-9 p-0",
            pageIndex === i && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {pageIndex !== i ? (
            <Link href={urlForPage(i, baseUrlPath)}>{i + 1}</Link>
          ) : (
            <span>{i + 1}</span>
          )}
        </Button>
      ))}
      
      {/* Última página e ellipsis */}
      {endIndex < numOfPages - 1 && (
        <>
          {endIndex < numOfPages - 2 && <span className="p-1 text-muted-foreground">&hellip;</span>}
          <Button variant="outline" size="sm" asChild className="h-9 w-9 p-0">
            <Link href={urlForPage(numOfPages - 1, baseUrlPath)}>{numOfPages}</Link>
          </Button>
        </>
      )}
      
      {/* Botão próximo */}
      {pageIndex < numOfPages - 1 ? (
        <Button 
          variant="outline" 
          size="icon" 
          asChild 
          className="h-9 w-9 p-0"
        >
          <Link href={urlForPage(pageIndex + 1, baseUrlPath)}>
            <span className="sr-only">Próxima página</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="icon" disabled className="h-9 w-9 p-0">
          <span className="sr-only">Próxima página</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </nav>
  );
}

// Função auxiliar para gerar URLs de página
function urlForPage(pageIndex, baseUrlPath) {
  return pageIndex === 0 ? baseUrlPath : \`\${baseUrlPath}/page/\${pageIndex + 1}\`;
}`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Guia de Migração</h3>
        <div className="p-4 bg-muted/50 rounded-md space-y-2">
          <h4 className="font-medium">Principais mudanças:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>Uso de componentes shadcn/ui: Button, Container, Card, Input</li>
            <li>Melhor semântica com elementos &lt;nav&gt; e atributos aria</li>
            <li>Sistema de design tokens para cores, espaçamentos e tipografia</li>
            <li>Componente de paginação modularizado e reutilizável</li>
            <li>Suporte a temas claro/escuro com tokens de cor adequados</li>
            <li>Estilização consistente com o restante do design system</li>
            <li>Responsividade melhorada para diferentes tamanhos de tela</li>
          </ul>
          
          <h4 className="font-medium mt-4">Benefícios da migração:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>Consistência visual com o resto do site</li>
            <li>Melhor acessibilidade (contraste, navegação por teclado, semântica)</li>
            <li>Manutenção simplificada com componentes padronizados</li>
            <li>Redução de código duplicado com componentes reutilizáveis</li>
            <li>Adaptação automática aos temas claro/escuro</li>
          </ul>
          
          <h4 className="font-medium mt-4">Considerações de implementação:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>O componente PostFeedCategoryLayout usa o PostFeedLayout diretamente</li>
            <li>A migração deste componente migra automaticamente o layout de categoria</li>
            <li>Os elementos de paginação usam o Button do shadcn/ui com a propriedade asChild</li>
            <li>A implementação usa tokens de cor (primary, muted-foreground) para temas</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 
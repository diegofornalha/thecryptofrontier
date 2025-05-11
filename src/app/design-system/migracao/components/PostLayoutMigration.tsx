"use client"

import React from 'react'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

// Componente para demonstrar a migração do Layout de Post
export function PostLayoutMigration() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Atual (PostLayout legado)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* Versão simplificada do PostLayout atual */}
          <article className="px-4 py-16">
            <div className="mx-auto max-w-screen-2xl">
              <header className="max-w-4xl mx-auto mb-12 text-center">
                <h1 className="text-3xl font-bold">O Futuro das Criptomoedas em 2023</h1>
                <div className="mt-4 text-sm uppercase">
                  <time dateTime="2023-06-15">2023-06-15</time>
                  <span className="mx-2">|</span>
                  <span>João Silva</span>
                </div>
              </header>
              
              <div className="max-w-3xl mx-auto sb-markdown">
                <p className="mb-4">
                  Este é um exemplo de conteúdo de um artigo de blog. No layout atual, 
                  o conteúdo é renderizado usando o componente Markdown.
                </p>
                <p className="mb-4">
                  O layout possui seções para título, data, autor e conteúdo principal, 
                  além de áreas para posts relacionados e compartilhamento social.
                </p>
              </div>
            </div>
            
            {/* Seção de posts relacionados simplificada */}
            <div className="my-16 py-8 bg-gray-50">
              <div className="max-w-screen-2xl mx-auto px-4">
                <h2 className="text-2xl font-bold mb-8 text-center">Posts Relacionados</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="p-4">
                      <h3 className="font-bold mb-2">
                        <a href="#" className="hover:text-blue-600">Web3 e o Futuro da Internet</a>
                      </h3>
                      <p className="text-sm text-gray-600">2023-05-10</p>
                    </div>
                  </div>
                  <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="p-4">
                      <h3 className="font-bold mb-2">
                        <a href="#" className="hover:text-blue-600">Bitcoin: Uma Década de Revolução</a>
                      </h3>
                      <p className="text-sm text-gray-600">2023-04-22</p>
                    </div>
                  </div>
                  <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="p-4">
                      <h3 className="font-bold mb-2">
                        <a href="#" className="hover:text-blue-600">DeFi: Oportunidades e Desafios</a>
                      </h3>
                      <p className="text-sm text-gray-600">2023-03-18</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Seção de compartilhamento */}
            <div className="mx-auto max-w-screen-2xl px-4 pb-16">
              <div className="max-w-3xl mx-auto mt-12 border-t border-b py-6 bg-gray-50 rounded-lg shadow-sm">
                <h3 className="text-center mb-4 font-medium">Gostou deste artigo? Compartilhe!</h3>
                <div className="flex justify-center gap-4">
                  <a href="#" className="text-blue-600 hover:text-blue-800">
                    <span className="sr-only">Compartilhar no Twitter</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </a>
                  <a href="#" className="text-blue-600 hover:text-blue-800">
                    <span className="sr-only">Compartilhar no LinkedIn</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// PostLayout atual
export default function PostLayout(props) {
  const { page, site } = props;
  const BaseLayout = getBaseLayoutComponent(page.baseLayout, site.baseLayout);
  const { enableAnnotations = true } = site;
  const { title, date, author = null, markdown_content, bottomSections = [], categories = [], slug } = page;
  const dateTimeAttr = dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  const formattedDate = dayjs(date).format('YYYY-MM-DD');
  const siteUrl = site.siteUrl || 'https://example.com';
  const postUrl = \`\${siteUrl}/post/\${slug}\`;

  return (
    <BaseLayout page={page} site={site}>
      <main id="main" className="sb-layout sb-post-layout">
        <article className="px-4 py-16 sm:py-28">
          <div className="mx-auto max-w-screen-2xl">
            <header className="max-w-4xl mx-auto mb-12 text-center">
              <h1>{title}</h1>
              <div className="mt-4 text-sm uppercase">
                <time dateTime={dateTimeAttr}>{formattedDate}</time>
                {author && (
                  <>
                    <span className="mx-2">|</span>
                    <PostAuthor author={author} />
                  </>
                )}
              </div>
            </header>
            {markdown_content && (
              <Markdown
                options={{ forceBlock: true }}
                className="max-w-3xl mx-auto sb-markdown"
              >
                {markdown_content}
              </Markdown>
            )}
          </div>
        </article>
        
        {/* Related Posts Section */}
        {categories && categories.length > 0 && (
          <RelatedPostsSection
            title="Posts Relacionados"
            colors={page.colors || 'bg-light-fg-dark'}
            currentPostCategories={categories}
            currentPostSlug={slug}
            limit={3}
          />
        )}
        
        {/* Bottomsections */}
        {bottomSections.length > 0 && (
          <div>
            {bottomSections.map((section, index) => {
              const Component = getComponent(section.__metadata.modelName);
              return (
                <Component key={index} {...section} />
              );
            })}
          </div>
        )}
        
        {/* Social share */}
        <div className="mx-auto max-w-screen-2xl px-4 pb-16">
          <div className="max-w-3xl mx-auto mt-12 border-t border-b py-6 bg-gray-50 rounded-lg shadow-sm">
            <h3 className="text-center mb-4 font-medium">Gostou deste artigo? Compartilhe!</h3>
            <SocialShare title={title} url={postUrl} className="justify-center" />
          </div>
        </div>
      </main>
    </BaseLayout>
  );
}`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Migrado (shadcn/ui)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* Layout de post migrado usando componentes shadcn/ui */}
          <article className="relative">
            <Container className="pt-16 pb-12 md:pt-24 md:pb-16">
              <div className="mx-auto max-w-3xl">
                <header className="mb-8 text-center">
                  <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-4">
                    O Futuro das Criptomoedas em 2023
                  </h1>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <time dateTime="2023-06-15">15 de junho de 2023</time>
                    <span>•</span>
                    <span>João Silva</span>
                  </div>
                </header>
                
                <div className="prose prose-stone dark:prose-invert mx-auto">
                  <p>
                    Este é um exemplo de conteúdo de artigo usando typography tokens do design system.
                    A migração para o shadcn/ui traz melhor tipografia, espaçamento e suporte a temas.
                  </p>
                  <p>
                    O layout foi otimizado para legibilidade e consistência visual com o restante do site.
                    Utiliza os componentes modernos do design system e tokens do Tailwind para estilização.
                  </p>
                </div>
              </div>
            </Container>
            
            {/* Compartilhamento na lateral para telas grandes */}
            <div className="hidden md:flex fixed left-[calc(50%-36rem)] bottom-1/2 translate-y-1/2 flex-col gap-4 opacity-70 hover:opacity-100 transition-opacity">
              <Button size="icon" variant="outline" className="rounded-full" aria-label="Compartilhar no Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Button>
              <Button size="icon" variant="outline" className="rounded-full" aria-label="Compartilhar no LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </Button>
            </div>
          </article>
          
          {/* Posts relacionados */}
          <div className="bg-muted py-16">
            <Container>
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold tracking-tight">Posts Relacionados</h2>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">
                      <Link href="#" className="hover:underline">Web3 e o Futuro da Internet</Link>
                    </h3>
                    <p className="text-sm text-muted-foreground">10 de maio de 2023</p>
                  </div>
                </div>
                <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">
                      <Link href="#" className="hover:underline">Bitcoin: Uma Década de Revolução</Link>
                    </h3>
                    <p className="text-sm text-muted-foreground">22 de abril de 2023</p>
                  </div>
                </div>
                <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">
                      <Link href="#" className="hover:underline">DeFi: Oportunidades e Desafios</Link>
                    </h3>
                    <p className="text-sm text-muted-foreground">18 de março de 2023</p>
                  </div>
                </div>
              </div>
            </Container>
          </div>
          
          {/* Compartilhamento para mobile */}
          <Container className="py-12">
            <div className="max-w-3xl mx-auto">
              <Separator className="mb-8" />
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium mb-4">Compartilhe este artigo</h3>
                <div className="flex justify-center gap-4">
                  <Button variant="outline" size="icon" className="rounded-full" aria-label="Compartilhar no Twitter">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full" aria-label="Compartilhar no LinkedIn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// PostLayout migrado com shadcn/ui
export default function PostLayout({ 
  params 
}: { 
  params: { slug: string } 
}) {
  // Busca dados do post com useQuery ou getStaticProps

  return (
    <article className="relative">
      <Container className="pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="mx-auto max-w-3xl">
          <header className="mb-8 text-center">
            <h1 className="scroll-m-20 text-4xl font-bold tracking-tight mb-4">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              {post.author && (
                <>
                  <span>•</span>
                  <span>{post.author.name}</span>
                </>
              )}
            </div>
          </header>
          
          <div className="prose prose-stone dark:prose-invert mx-auto">
            {/* Renderização do conteúdo do post */}
            {post.content}
          </div>
        </div>
      </Container>
      
      {/* Componente de compartilhamento lateral */}
      <SocialShareSidebar title={post.title} url={post.url} />
      
      {/* Componente de posts relacionados */}
      <RelatedPosts 
        categories={post.categories} 
        currentSlug={params.slug} 
      />
      
      {/* Compartilhamento para mobile */}
      <Container className="py-12">
        <div className="max-w-3xl mx-auto">
          <Separator className="mb-8" />
          <SocialShareMobile title={post.title} url={post.url} />
        </div>
      </Container>
    </article>
  );
}`}</code>
        </pre>
      </div>

      <div className="p-4 border border-dashed rounded-md">
        <h3 className="text-lg font-medium mb-4">Guia de Migração</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li>Migrar para a estrutura de rotas do App Router do Next.js</li>
          <li>Substituir classes personalizadas por classes utilitárias do Tailwind CSS</li>
          <li>Usar tokens do design system para tipografia, cores e espaçamento</li>
          <li>Utilizar <code>Container</code> para padronizar o layout</li>
          <li>Implementar o plugin typography para melhor formatação do conteúdo do post</li>
          <li>Utilizar <code>Button</code> com variantes para os botões de compartilhamento</li>
          <li>Separar os componentes em arquivos individuais para melhor manutenção</li>
          <li>Usar <code>Separator</code> para divisões visuais</li>
          <li>Implementar layout responsivo com elementos posicionados de forma diferente em mobile e desktop</li>
          <li>Criar componentes específicos para compartilhamento social</li>
        </ul>
        
        <div className="mt-4">
          <h4 className="font-medium mb-2">Benefícios da migração:</h4>
          <ul className="space-y-1 list-disc pl-5">
            <li>Melhor experiência de leitura com tipografia otimizada</li>
            <li>Suporte a temas claro/escuro</li>
            <li>Layout mais responsivo e adaptável a diferentes dispositivos</li>
            <li>Elementos de UI mais modernos e consistentes</li>
            <li>Compartilhamento social mais acessível e visualmente integrado</li>
            <li>Separação de componentes para melhor manutenção</li>
            <li>Performance aprimorada com componentes otimizados</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 
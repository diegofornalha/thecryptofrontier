"use client"

import { Metadata } from "next"
import { Container } from "@/components/ui/container"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { H1, H2, Paragraph, Lead } from "@/components/ui/typography"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ButtonMigration, 
  LinkMigration, 
  ChartsMigration, 
  BadgeMigration,
  AvatarMigration,
  FormInputMigration,
  CardMigration,
  DialogMigration,
  HeaderMigration,
  FooterMigration,
  LayoutMigration,
  PostLayoutMigration,
  PostFeedLayoutMigration,
  ImageBlockMigration,
  FormBlockMigration,
  SearchBlockMigration,
  TitleBlockMigration,
  VideoBlockMigration
} from './components'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

// Substituir a função que usa fs com um fallback simples
const FALLBACK_CONTENT = `
# Plano de Migração para shadcn/ui

## Visão Geral

Este documento descreve o plano para migração dos componentes legados para o design system moderno baseado em shadcn/ui.

## Componentes a Migrar

- [x] Botões
- [x] Links
- [x] Badges
- [ ] Inputs
- [ ] Cards
- [ ] Layout
`;

export default function MigracaoPage() {
  // Usar o conteúdo de fallback em vez de ler do sistema de arquivos
  const migracaoContent = FALLBACK_CONTENT;
  
  return (
    <Container>
      <div className="py-10 space-y-8">
        <div>
          <div className="flex items-start justify-between">
            <div>
              <H1>Plano de Migração para shadcn/ui</H1>
              <p className="text-xl text-muted-foreground">
                Documentação e exemplos para migração dos componentes
              </p>
            </div>
            <Link 
              href="/design-system" 
              className="text-primary hover:underline"
            >
              ← Voltar para Design System
            </Link>
          </div>
          <Separator className="my-6" />
        </div>

        <Tabs defaultValue="plano">
          <TabsList className="mb-6 flex flex-wrap gap-1">
            <TabsTrigger value="plano">Plano de Migração</TabsTrigger>
            <TabsTrigger value="botoes">Botões</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="avatar">Avatar</TabsTrigger>
            <TabsTrigger value="form">Form Inputs</TabsTrigger>
            <TabsTrigger value="card">Cards</TabsTrigger>
            <TabsTrigger value="dialog">Dialog</TabsTrigger>
            <TabsTrigger value="header">Header</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="postlayout">Layout de Post</TabsTrigger>
            <TabsTrigger value="postfeedlayout">Layout de Categoria</TabsTrigger>
            <TabsTrigger value="imageblock">Bloco de Imagem</TabsTrigger>
            <TabsTrigger value="formblock">Bloco de Formulário</TabsTrigger>
            <TabsTrigger value="searchblock">Bloco de Pesquisa</TabsTrigger>
            <TabsTrigger value="titleblock">Bloco de Título</TabsTrigger>
            <TabsTrigger value="videoblock">Bloco de Vídeo</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plano">
            <div className="prose prose-blue dark:prose-invert max-w-none">
              {/* Exibir conteúdo MDX convertido para HTML */}
              <div dangerouslySetInnerHTML={{ __html: renderMarkdown(migracaoContent) }} />
            </div>
          </TabsContent>
          
          <TabsContent value="botoes">
            <div className="space-y-6">
              <div>
                <H2>Migração de Botões</H2>
                <Paragraph>
                  Demonstração da migração dos componentes Action para Button do shadcn/ui.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <ButtonMigration />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="links">
            <div className="space-y-6">
              <div>
                <H2>Migração de Links</H2>
                <Paragraph>
                  Demonstração da migração dos componentes Link para versão atualizada baseada em shadcn/ui.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <LinkMigration />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="charts">
            <div className="space-y-6">
              <div>
                <H2>Migração de Gráficos</H2>
                <Paragraph>
                  Demonstração da migração dos componentes de gráficos para versão moderna seguindo princípios do shadcn/ui.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <ChartsMigration />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="badges">
            <div className="space-y-6">
              <div>
                <H2>Migração de Badges</H2>
                <Paragraph>
                  Demonstração da migração dos componentes Badge para versão baseada em shadcn/ui.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <BadgeMigration />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="avatar">
            <div className="space-y-6">
              <div>
                <H2>Migração de Avatar</H2>
                <Paragraph>
                  Demonstração da migração dos componentes de avatar para o Avatar do shadcn/ui.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <AvatarMigration />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="form">
            <div className="space-y-6">
              <div>
                <H2>Migração de Inputs de Formulário</H2>
                <Paragraph>
                  Demonstração da migração dos inputs e controles de formulário para os componentes do shadcn/ui.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <FormInputMigration />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="card">
            <div className="space-y-6">
              <div>
                <H2>Migração de Cards</H2>
                <Paragraph>
                  Demonstração da migração dos cards para os componentes Card do shadcn/ui.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <CardMigration />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="dialog">
            <div className="space-y-6">
              <div>
                <H2>Migração de Dialog/Modal</H2>
                <Paragraph>
                  Demonstração da migração dos componentes de diálogo/modal para o Dialog do shadcn/ui.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <DialogMigration />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="header">
            <div className="space-y-6">
              <div>
                <H2>Migração de Header</H2>
                <Paragraph>
                  Demonstração da migração do componente Header para utilizar o design system baseado em shadcn/ui.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <HeaderMigration />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="footer">
            <div className="space-y-6">
              <div>
                <H2>Migração de Footer</H2>
                <Paragraph>
                  Demonstração da migração do componente Footer para utilizar o design system baseado em shadcn/ui.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <FooterMigration />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="layout">
            <div className="space-y-6">
              <div>
                <H2>Migração de Layout Principal</H2>
                <Paragraph>
                  Demonstração da migração do Layout Principal para utilizar o design system baseado em shadcn/ui e o App Router do Next.js.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <LayoutMigration />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="postlayout">
            <div className="space-y-6">
              <div>
                <H2>Migração de Layout de Post</H2>
                <Paragraph>
                  Demonstração da migração do Layout de Post para utilizar o design system baseado em shadcn/ui.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <PostLayoutMigration />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="postfeedlayout">
            <div className="space-y-6">
              <div>
                <H2>Migração de Layout de Categoria</H2>
                <Paragraph>
                  Demonstração da migração do Layout de Feed de Posts e Categorias para utilizar o design system baseado em shadcn/ui.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <PostFeedLayoutMigration />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="imageblock">
            <div className="space-y-6">
              <div>
                <H2>Migração de Bloco de Imagem</H2>
                <Paragraph>
                  Demonstração da migração do componente ImageBlock para utilizar o Image do Next.js com o design system baseado em shadcn/ui.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <ImageBlockMigration />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="formblock">
            <div className="space-y-6">
              <div>
                <H2>Migração de Bloco de Formulário</H2>
                <Paragraph>
                  Demonstração da migração do componente FormBlock para utilizar o sistema de formulários do shadcn/ui com validação integrada.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <FormBlockMigration />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="searchblock">
            <div className="space-y-6">
              <div>
                <H2>Migração de Bloco de Pesquisa</H2>
                <Paragraph>
                  Demonstração da migração do componente SearchBlock para utilizar componentes modernos de pesquisa do shadcn/ui.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <SearchBlockMigration />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="titleblock">
            <div className="space-y-6">
              <div>
                <H2>Migração de Bloco de Título</H2>
                <Paragraph>
                  Demonstração da migração do componente TitleBlock para utilizar os tokens de tipografia do shadcn/ui.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <TitleBlockMigration />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="videoblock">
            <div className="space-y-6">
              <div>
                <H2>Migração de Bloco de Vídeo</H2>
                <Paragraph>
                  Demonstração da migração do componente VideoBlock para utilizar aspecto moderno e tokens do shadcn/ui.
                </Paragraph>
              </div>
              <div className="p-6 border rounded-lg bg-card">
                <VideoBlockMigration />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  )
}

// Função simples para renderizar markdown
function renderMarkdown(content: string): string {
  return content
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-5 mb-2">$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4 class="text-lg font-bold mt-4 mb-2">$1</h4>')
    .replace(/^\- \[ \] (.+)$/gm, '<div class="flex items-start gap-2 mb-1"><input type="checkbox" disabled /><span>$1</span></div>')
    .replace(/^\- \[x\] (.+)$/gm, '<div class="flex items-start gap-2 mb-1"><input type="checkbox" checked disabled /><span>$1</span></div>')
    .replace(/^\- (.+)$/gm, '<li class="mb-1">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<div class="mb-2"><span class="font-bold">$1.</span> $2</div>')
    .replace(/\n\n/g, '</p><p class="my-4">')
}

// Remover a função MigracaoTestPage que causava o erro de tipo 
import { Metadata } from "next"
import { Container } from "@/components/ui/container"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { H1, Lead } from "@/components/ui/typography"
import Link from "next/link"
import fs from 'fs'
import path from 'path'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Plano de Migração - Design System",
  description: "Plano de migração para o shadcn/ui no The Crypto Frontier",
}

export default function MigracaoPage() {
  return (
    <div className="container mx-auto py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Migração para shadcn/ui</h1>
        <p className="text-lg mb-8">
          Esta seção contém recursos e documentação para a migração dos componentes atuais para o sistema de design shadcn/ui.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-card text-card-foreground p-6 rounded-lg border shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Fase 1: Análise e Planejamento</h2>
            <p className="mb-6">Análise do código existente, mapeamento de componentes e preparação para a migração.</p>
            <div className="flex flex-col gap-3">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/design-system/migracao/inventario-componentes">Inventário de Componentes</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/design-system/migracao/relatorio-progresso">Relatório de Progresso</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/design-system/migracao/test-page">Página de Teste</Link>
              </Button>
            </div>
          </div>
          
          <div className="bg-card text-card-foreground p-6 rounded-lg border shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Componentes Migrados</h2>
            <p className="mb-6">Versões dos componentes adaptados para o shadcn/ui.</p>
            <div className="flex flex-col gap-3">
              <Button asChild variant="outline" className="justify-start">
                <Link href="/design-system/migracao/components/Action.tsx">Action → Button</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/design-system/migracao/components/Badge.tsx">Badge → Badge</Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href="/design-system/migracao/components/Link.tsx">Link → Button(variant="link")</Link>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Status da Migração</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Progresso Geral</h3>
              <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
                <div className="bg-primary h-full" style={{ width: "30%" }}></div>
              </div>
              <p className="text-sm mt-1">30% concluído - Fase 1 em andamento</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Componentes Atômicos</h3>
                <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: "50%" }}></div>
                </div>
                <p className="text-sm mt-1">3 de 6 concluídos</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Componentes de Bloco</h3>
                <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: "0%" }}></div>
                </div>
                <p className="text-sm mt-1">0 de 5 concluídos</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Layouts/Seções</h3>
                <div className="w-full bg-secondary h-4 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: "0%" }}></div>
                </div>
                <p className="text-sm mt-1">0 de 10 concluídos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Função simples para renderizar markdown (apenas para demonstração)
function renderMarkdown(content: string): string {
  return content
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-5 mb-2">$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4 class="text-lg font-bold mt-4 mb-2">$1</h4>')
    .replace(/^\- \[ \] (.+)$/gm, '<div class="flex items-start gap-2 mb-1"><input type="checkbox" disabled /><span>$1</span></div>')
    .replace(/^\- (.+)$/gm, '<li class="mb-1">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<div class="mb-2"><span class="font-bold">$1.</span> $2</div>')
    .replace(/\n\n/g, '</p><p class="my-4">')
}

export function MigracaoTestPage() {
  return (
    <div className="container mx-auto py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-8">Teste de Componentes Migrados</h1>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Botões (Button / Action)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl mb-2">Variantes</h3>
                <div className="flex flex-wrap gap-4">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl mb-2">Com Ícones</h3>
                <div className="flex flex-wrap gap-4">
                  <Button>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m16 12-4 4-4-4" />
                      <path d="M12 8v8" />
                    </svg>
                    Ícone à Esquerda
                  </Button>
                  
                  <Button variant="secondary">
                    Ícone à Direita
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 h-4 w-4">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Badges</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Badge className="bg-blue-500 hover:bg-blue-600">Personalizado</Badge>
                <Badge className="uppercase tracking-wider">Estilizado</Badge>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Links</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="link" asChild>
                  <Link href="/">Link Interno</Link>
                </Button>
                
                <Button variant="link" asChild>
                  <a href="https://exemplo.com" target="_blank" rel="noopener noreferrer">
                    Link Externo
                  </a>
                </Button>
                
                <Button variant="link" className="p-0 h-auto" asChild>
                  <Link href="/contato">
                    Link sem Padding
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 
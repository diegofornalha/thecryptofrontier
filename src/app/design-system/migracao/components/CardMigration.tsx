"use client"

import React from 'react'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Componente para demonstrar a migração de cards
export function CardMigration() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Atual (Card legado)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Exemplo de card simples legado */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold">Card Legado</h3>
              <p className="text-sm text-gray-500 mt-1">
                Uma descrição simples para este card
              </p>
              <div className="mt-4">
                <p className="text-sm text-gray-700">
                  Este é um exemplo de card implementado com divs e classes utilitárias.
                  É funcional, mas não segue um padrão de componentes.
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Ação
                </button>
              </div>
            </div>
          </div>
          
          {/* Exemplo de card com imagem legado */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="relative h-48 bg-gray-200">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                [Imagem]
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold">Card com Imagem</h3>
              <p className="text-sm text-gray-500 mt-1">
                Card com uma imagem destacada
              </p>
              <div className="mt-4">
                <p className="text-sm text-gray-700">
                  Este card inclui uma área para imagem em destaque seguida pelo conteúdo.
                </p>
              </div>
              <div className="mt-4 flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                  Cancelar
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// Card legado implementado com divs
<div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
  <div className="p-4 sm:p-6">
    <h3 className="text-lg font-semibold">Card Legado</h3>
    <p className="text-sm text-gray-500 mt-1">
      Uma descrição simples para este card
    </p>
    <div className="mt-4">
      <p className="text-sm text-gray-700">
        Conteúdo do card...
      </p>
    </div>
    <div className="mt-4 flex justify-end">
      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        Ação
      </button>
    </div>
  </div>
</div>`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Migrado (shadcn/ui Card)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card simples do shadcn/ui */}
          <Card>
            <CardHeader>
              <CardTitle>Card Migrado</CardTitle>
              <CardDescription>
                Uma descrição simples para este card
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                Este é um exemplo de card usando o componente Card do shadcn/ui.
                A estrutura é clara e consistente com outros componentes.
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Ação</Button>
            </CardFooter>
          </Card>
          
          {/* Card com imagem do shadcn/ui */}
          <Card>
            <div className="relative h-48 bg-gray-200">
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                [Imagem]
              </div>
            </div>
            <CardHeader>
              <CardTitle>Card com Imagem</CardTitle>
              <CardDescription>
                Card com uma imagem destacada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                O componente Card do shadcn/ui é flexível e permite incluir qualquer conteúdo.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancelar</Button>
              <Button>Confirmar</Button>
            </CardFooter>
          </Card>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// Card usando componentes do shadcn/ui
<Card>
  <CardHeader>
    <CardTitle>Card Migrado</CardTitle>
    <CardDescription>
      Uma descrição simples para este card
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-gray-700">
      Conteúdo do card...
    </p>
  </CardContent>
  <CardFooter className="flex justify-end">
    <Button>Ação</Button>
  </CardFooter>
</Card>`}</code>
        </pre>
      </div>

      <div className="p-4 border border-dashed rounded-md">
        <h3 className="text-lg font-medium mb-4">Guia de Migração</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li>Substituir divs customizados pelos componentes <code>Card</code>, <code>CardHeader</code>, <code>CardContent</code> e <code>CardFooter</code></li>
          <li>Usar <code>CardTitle</code> e <code>CardDescription</code> para os títulos e descrições</li>
          <li>Manter a estrutura semântica consistente em todos os cards</li>
          <li>Aproveitar a flexibilidade do componente para diferentes layouts</li>
          <li>Integrar com outros componentes do shadcn/ui como Button, Avatar, etc.</li>
          <li>Usar <code>className</code> e <code>cn()</code> para customizações específicas</li>
          <li>Manter o espaçamento interno consistente usando os componentes de layout</li>
        </ul>
      </div>
    </div>
  )
} 
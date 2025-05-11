"use client"

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Componente para demonstrar a migração de badges
export function BadgeMigration() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Atual (Badge)</h3>
        <div className="flex flex-wrap gap-4">
          <div className="inline-flex h-6 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-blue-100 text-blue-800 border-blue-200">
            Legacy Badge
          </div>
          <div className="inline-flex h-6 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-green-100 text-green-800 border-green-200">
            Primary
          </div>
          <div className="inline-flex h-6 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-gray-100 text-gray-800 border-gray-200">
            Secondary
          </div>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// Componente atual (estilo inline)
<div className="inline-flex h-6 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-blue-100 text-blue-800 border-blue-200">
  Legacy Badge
</div>`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Migrado (shadcn/ui Badge)</h3>
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge className="bg-blue-500 hover:bg-blue-600">Custom</Badge>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// Componente migrado
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge className="bg-blue-500 hover:bg-blue-600">Custom</Badge>`}</code>
        </pre>
      </div>

      <div className="p-4 border border-dashed rounded-md">
        <h3 className="text-lg font-medium mb-4">Guia de Migração</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li>Substituir divs e spans com classes inline por <code>Badge</code> do shadcn/ui</li>
          <li>Utilizar o sistema de variantes: default, secondary, outline, destructive</li>
          <li>Para personalização avançada, usar <code>className</code> com Tailwind</li>
          <li>Componente Badge suporta atributos HTML padrão + propriedade variant</li>
          <li>Usar <code>asChild</code> para renderizar Badge dentro de outros elementos</li>
        </ul>
      </div>
    </div>
  )
} 
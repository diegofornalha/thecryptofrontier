"use client"

import React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// Componente para demonstrar a migração de avatar
export function AvatarMigration() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Atual (Avatar legado)</h3>
        <div className="flex flex-wrap gap-4">
          {/* Exemplo de avatar com imagem implementado de forma antiga */}
          <div className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border">
            <Image 
              src="https://github.com/shadcn.png" 
              alt="Avatar" 
              width={40} 
              height={40}
              className="h-full w-full object-cover"
            />
          </div>
          
          {/* Exemplo de avatar com iniciais implementado de forma antiga */}
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-800">
            <span className="text-sm font-medium">JD</span>
          </div>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// Avatar antigo com imagem
<div className="relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border">
  <Image 
    src="/path/to/avatar.jpg" 
    alt="Avatar" 
    width={40} 
    height={40}
    className="h-full w-full object-cover"
  />
</div>

// Avatar antigo com iniciais
<div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-800">
  <span className="text-sm font-medium">JD</span>
</div>`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Migrado (shadcn/ui Avatar)</h3>
        <div className="flex flex-wrap gap-4">
          {/* Avatar com imagem */}
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          
          {/* Avatar com fallback */}
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          
          {/* Avatar com tamanho customizado */}
          <Avatar className="h-14 w-14">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          
          {/* Avatar com cor de fundo customizada */}
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              TF
            </AvatarFallback>
          </Avatar>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// Avatar com imagem e fallback
<Avatar>
  <AvatarImage src="/path/to/avatar.jpg" alt="Nome do usuário" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

// Avatar apenas com iniciais
<Avatar>
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

// Avatar com tamanho customizado
<Avatar className="h-14 w-14">
  <AvatarImage src="/path/to/avatar.jpg" alt="Nome do usuário" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>

// Avatar com cor de fundo customizada
<Avatar>
  <AvatarFallback className="bg-primary text-primary-foreground">
    TF
  </AvatarFallback>
</Avatar>`}</code>
        </pre>
      </div>

      <div className="p-4 border border-dashed rounded-md">
        <h3 className="text-lg font-medium mb-4">Guia de Migração</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li>Substituir divs customizadas por <code>Avatar</code>, <code>AvatarImage</code> e <code>AvatarFallback</code> do shadcn/ui</li>
          <li>Usar <code>AvatarImage</code> para exibir a imagem do usuário</li>
          <li>Implementar <code>AvatarFallback</code> para mostrar conteúdo alternativo quando a imagem não estiver disponível</li>
          <li>Aproveitar o sistema de acessibilidade já implementado</li>
          <li>Customizar tamanhos através de classes no componente Avatar</li>
          <li>Usar <code>className</code> e <code>cn()</code> para estilos personalizados</li>
        </ul>
      </div>
    </div>
  )
} 
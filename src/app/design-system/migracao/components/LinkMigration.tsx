"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import NextLink from 'next/link'
import Link from '@/components/atoms/Link'

// Componente para demonstrar a migração de links
export function LinkMigration() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Atual (Link)</h3>
        <div className="flex flex-wrap gap-8">
          <Link href="/design-system" className="">Link Interno</Link>
          <Link href="https://example.com" className="">Link Externo</Link>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// Componente atual
<Link href="/design-system">Link Interno</Link>
<Link href="https://example.com">Link Externo</Link>`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Migrado (Link personalizado)</h3>
        <div className="flex flex-wrap gap-8">
          <MigratedLink href="/design-system">Link Interno</MigratedLink>
          <MigratedLink href="https://example.com">Link Externo</MigratedLink>
          <MigratedLink 
            href="/design-system" 
            variant="primary"
          >
            Link Primário
          </MigratedLink>
          <MigratedLink 
            href="/design-system" 
            variant="muted"
          >
            Link Muted
          </MigratedLink>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// Componente migrado
<Link href="/design-system">Link Interno</Link>
<Link href="https://example.com">Link Externo</Link>
<Link href="/design-system" variant="primary">Link Primário</Link>
<Link href="/design-system" variant="muted">Link Muted</Link>`}</code>
        </pre>
      </div>

      <div className="p-4 border border-dashed rounded-md">
        <h3 className="text-lg font-medium mb-4">Guia de Migração</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li>Manter a API existente do componente Link para backward compatibility</li>
          <li>Adicionar suporte a variantes (padrão, primary, muted, etc.)</li>
          <li>Usar <code>cn()</code> para composição de classes conforme shadcn/ui</li>
          <li>Manter detecção automática de links internos/externos</li>
          <li>Adicionar transições e estados para melhor feedback visual</li>
        </ul>
      </div>
    </div>
  )
}

// Exemplo de implementação do novo Link
interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  variant?: 'default' | 'primary' | 'muted'
}

function MigratedLink({ 
  children, 
  href, 
  className, 
  variant = 'default',
  ...props 
}: LinkProps) {
  // Detectar links internos
  const internal = /^\/(?!\/)/.test(href)
  
  // Estilos de variantes
  const variantStyles = {
    default: 'text-blue-600 hover:text-blue-800 hover:underline transition-colors',
    primary: 'text-primary font-medium hover:underline transition-colors',
    muted: 'text-muted-foreground hover:text-foreground transition-colors',
  }
  
  // Combinar classes
  const linkClasses = cn(
    variantStyles[variant],
    className
  )
  
  if (internal) {
    return (
      <NextLink href={href} className={linkClasses} {...props}>
        {children}
      </NextLink>
    )
  }
  
  return (
    <a 
      href={href} 
      className={linkClasses} 
      target="_blank" 
      rel="noopener noreferrer" 
      {...props}
    >
      {children}
    </a>
  )
} 
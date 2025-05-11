"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// Componente para demonstrar a migração do Header
export function HeaderMigration() {
  // Estado para controlar o menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Atual (Header legado)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* Versão simplificada do Header atual */}
          <header className="relative bg-white shadow-md p-4 z-50">
            <div className="mx-auto max-w-7xl">
              <div className="relative flex items-center">
                {/* Logo */}
                <div className="mr-10">
                  <a href="/" className="flex items-center">
                    <span className="text-xl font-bold">The Crypto Frontier</span>
                  </a>
                </div>
                
                {/* Links Primários */}
                <ul className="hidden mr-10 gap-x-10 lg:flex lg:items-center">
                  <li>
                    <a href="/blog" className="text-gray-700 hover:text-blue-600">Blog</a>
                  </li>
                  <li>
                    <a href="/about" className="text-gray-700 hover:text-blue-600">Sobre</a>
                  </li>
                  <li className="relative group">
                    <div className="flex items-center">
                      <a href="/services" className="text-gray-700 hover:text-blue-600 mr-1">Serviços</a>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                    <ul className="absolute hidden group-hover:block bg-white shadow-lg mt-2 py-2 w-48 rounded-md z-10">
                      <li>
                        <a href="/services/crypto-advisory" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Consultoria Crypto</a>
                      </li>
                      <li>
                        <a href="/services/blockchain-solutions" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Soluções Blockchain</a>
                      </li>
                    </ul>
                  </li>
                </ul>
                
                {/* Links Secundários */}
                <ul className="hidden ml-auto gap-x-2.5 lg:flex lg:items-center">
                  <li>
                    <a href="/login" className="inline-block px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Login</a>
                  </li>
                  <li>
                    <a href="/signup" className="inline-block px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Cadastrar</a>
                  </li>
                </ul>
                
                {/* Menu Mobile */}
                <div className="ml-auto lg:hidden">
                  <button 
                    aria-label="Abrir Menu" 
                    title="Abrir Menu" 
                    className="p-2 -mr-1 focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </header>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// Header Legado
<header className="relative bg-white shadow-md p-4 z-50">
  <div className="mx-auto max-w-7xl">
    <div className="relative flex items-center">
      {/* Logo */}
      <div className="mr-10">
        <a href="/" className="flex items-center">
          <span className="text-xl font-bold">The Crypto Frontier</span>
        </a>
      </div>
      
      {/* Links Primários */}
      <ul className="hidden mr-10 gap-x-10 lg:flex lg:items-center">
        <li>
          <a href="/blog" className="text-gray-700 hover:text-blue-600">Blog</a>
        </li>
        <li>
          <a href="/about" className="text-gray-700 hover:text-blue-600">Sobre</a>
        </li>
        {/* Menu dropdown */}
        <li className="relative group">
          <div className="flex items-center">
            <a href="/services" className="text-gray-700 hover:text-blue-600 mr-1">Serviços</a>
            <svg className="w-4 h-4">...</svg>
          </div>
          <ul className="absolute hidden group-hover:block bg-white shadow-lg...">
            <li><a href="/services/crypto-advisory">Consultoria Crypto</a></li>
            <li><a href="/services/blockchain-solutions">Soluções Blockchain</a></li>
          </ul>
        </li>
      </ul>
      
      {/* Links Secundários */}
      <ul className="hidden ml-auto gap-x-2.5 lg:flex lg:items-center">
        <li><a href="/login" className="inline-block px-4 py-2 border...">Login</a></li>
        <li><a href="/signup" className="inline-block px-4 py-2 bg-blue-600...">Cadastrar</a></li>
      </ul>
      
      {/* Menu Mobile */}
      <div className="ml-auto lg:hidden">
        <button onClick={() => setIsMobileMenuOpen(true)}>
          <svg>...</svg>
        </button>
      </div>
    </div>
  </div>
</header>`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Migrado (shadcn/ui)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* Header migrado usando componentes shadcn/ui */}
          <header className="border-b">
            <Container>
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-6 md:gap-10">
                  <Link href="/" className="flex items-center space-x-2">
                    <span className="inline-block font-bold">The Crypto Frontier</span>
                  </Link>
                  
                  <nav className="hidden gap-6 md:flex">
                    <Link
                      href="/blog"
                      className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      Blog
                    </Link>
                    <Link
                      href="/about"
                      className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                      Sobre
                    </Link>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                        Serviços
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 h-4 w-4">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                          <Link href="/services/crypto-advisory">Consultoria Crypto</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/services/blockchain-solutions">Soluções Blockchain</Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </nav>
                </div>
                
                <div className="hidden md:flex md:items-center md:gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Cadastrar</Link>
                  </Button>
                </div>
                
                <button 
                  className="flex items-center md:hidden"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <span className="sr-only">Abrir menu</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                </button>
              </div>
              
              {/* Menu mobile */}
              {isMobileMenuOpen && (
                <div className="md:hidden">
                  <div className="space-y-4 px-2 py-3">
                    <Link
                      href="/blog"
                      className="flex items-center text-sm font-medium transition-colors hover:text-primary"
                    >
                      Blog
                    </Link>
                    <Link
                      href="/about"
                      className="flex items-center text-sm font-medium transition-colors hover:text-primary"
                    >
                      Sobre
                    </Link>
                    <div className="space-y-2">
                      <div className="font-medium">Serviços</div>
                      <div className="pl-4 space-y-1">
                        <Link
                          href="/services/crypto-advisory"
                          className="block text-sm transition-colors hover:text-primary"
                        >
                          Consultoria Crypto
                        </Link>
                        <Link
                          href="/services/blockchain-solutions"
                          className="block text-sm transition-colors hover:text-primary"
                        >
                          Soluções Blockchain
                        </Link>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                      <Button variant="outline" asChild>
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/signup">Cadastrar</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Container>
          </header>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// Header migrado com shadcn/ui
<header className="border-b">
  <Container>
    <div className="flex h-16 items-center justify-between">
      <div className="flex items-center gap-6 md:gap-10">
        <Link href="/" className="flex items-center space-x-2">
          <span className="inline-block font-bold">Site Logo</span>
        </Link>
        
        <nav className="hidden gap-6 md:flex">
          <Link
            href="/blog"
            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Blog
          </Link>
          <Link
            href="/about"
            className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Sobre
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-sm font-medium text-muted-foreground">
              Serviços
              <svg className="ml-1 h-4 w-4">...</svg>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href="/services/crypto-advisory">Consultoria Crypto</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/services/blockchain-solutions">Soluções Blockchain</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
      
      <div className="hidden md:flex md:items-center md:gap-2">
        <Button variant="outline" asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/signup">Cadastrar</Link>
        </Button>
      </div>
      
      <button 
        className="flex items-center md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <svg>...</svg>
      </button>
    </div>
    
    {/* Menu mobile */}
    {isMobileMenuOpen && (
      <div className="md:hidden">
        <div className="space-y-4 px-2 py-3">
          {/* Links de navegação */}
          {/* Botões */}
        </div>
      </div>
    )}
  </Container>
</header>`}</code>
        </pre>
      </div>

      <div className="p-4 border border-dashed rounded-md">
        <h3 className="text-lg font-medium mb-4">Guia de Migração</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li>Substituir o header personalizado pelo padrão com componentes shadcn/ui</li>
          <li>Usar <code>Container</code> para controlar o layout e largura máxima</li>
          <li>Substituir menus dropdown por <code>DropdownMenu</code> do shadcn/ui</li>
          <li>Substituir botões por <code>Button</code> com variantes apropriadas</li>
          <li>Usar <code>Link</code> do Next.js com <code>asChild</code> para manter a navegação client-side</li>
          <li>Adotar classes de utilidade para espaçamento e responsividade</li>
          <li>Implementar menu mobile de forma acessível</li>
          <li>Usar tokens do design system para cores e tipografia</li>
          <li>Remover estilos personalizados e utilizar o sistema de variantes do shadcn/ui</li>
        </ul>
        
        <div className="mt-4">
          <h4 className="font-medium mb-2">Benefícios da migração:</h4>
          <ul className="space-y-1 list-disc pl-5">
            <li>Melhor acessibilidade nos menus e dropdowns</li>
            <li>Consistência visual com o restante do design system</li>
            <li>Facilidade de manutenção com menos código customizado</li>
            <li>Performance otimizada com componentes simplificados</li>
            <li>Facilidade para implementar temas claro/escuro</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 
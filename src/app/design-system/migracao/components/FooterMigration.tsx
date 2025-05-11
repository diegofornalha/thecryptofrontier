"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// Componente para demonstrar a migração do Footer
export function FooterMigration() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Atual (Footer legado)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* Versão simplificada do Footer atual */}
          <footer className="bg-gray-50 px-4 py-16">
            <div className="mx-auto max-w-7xl">
              <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-8">
                <div className="pb-8 sm:col-span-3 lg:col-auto">
                  <a href="/" className="flex flex-col items-start">
                    <div className="h4">The Crypto Frontier</div>
                  </a>
                  <div className="text-sm mt-4">
                    <p>Explorando o futuro das criptomoedas e da tecnologia blockchain para ajudar a navegar nessa nova fronteira financeira.</p>
                  </div>
                </div>
                
                <div className="pb-8">
                  <h2 className="uppercase text-base tracking-wide">Explorar</h2>
                  <ul className="space-y-3 mt-7">
                    <li>
                      <a href="/blog" className="text-sm text-gray-700 hover:text-blue-600">Blog</a>
                    </li>
                    <li>
                      <a href="/about" className="text-sm text-gray-700 hover:text-blue-600">Sobre</a>
                    </li>
                    <li>
                      <a href="/services" className="text-sm text-gray-700 hover:text-blue-600">Serviços</a>
                    </li>
                  </ul>
                </div>
                
                <div className="pb-8">
                  <h2 className="uppercase text-base tracking-wide">Contato</h2>
                  <ul className="space-y-3 mt-7">
                    <li>
                      <a href="/contact" className="text-sm text-gray-700 hover:text-blue-600">Fale Conosco</a>
                    </li>
                    <li>
                      <a href="/support" className="text-sm text-gray-700 hover:text-blue-600">Suporte</a>
                    </li>
                    <li>
                      <a href="/faq" className="text-sm text-gray-700 hover:text-blue-600">FAQ</a>
                    </li>
                  </ul>
                </div>
                
                <div className="pb-6">
                  <ul className="flex flex-wrap items-center">
                    <li className="text-2xl mb-2 mr-8 lg:mr-12 last:mr-0">
                      <a href="https://twitter.com" aria-label="Twitter" title="Twitter" target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                        </svg>
                      </a>
                    </li>
                    <li className="text-2xl mb-2 mr-8 lg:mr-12 last:mr-0">
                      <a href="https://linkedin.com" aria-label="LinkedIn" title="LinkedIn" target="_blank" rel="noopener noreferrer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                          <rect x="2" y="9" width="4" height="12"></rect>
                          <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t pt-8 mt-16 flex flex-col sm:flex-row sm:flex-wrap sm:justify-between">
                <ul className="flex flex-wrap mb-3">
                  <li className="mb-1 mr-6 last:mr-0">
                    <a href="/privacidade" className="text-sm text-gray-700 hover:text-blue-600">Política de Privacidade</a>
                  </li>
                  <li className="mb-1 mr-6 last:mr-0">
                    <a href="/termos" className="text-sm text-gray-700 hover:text-blue-600">Termos de Uso</a>
                  </li>
                </ul>
                <p className="text-sm mb-4 sm:order-first sm:mr-12">
                  © 2023 The Crypto Frontier. Todos os direitos reservados.
                </p>
              </div>
            </div>
          </footer>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// Footer Legado
<footer className="bg-gray-50 px-4 py-16">
  <div className="mx-auto max-w-7xl">
    <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-8">
      {/* Seção de informações */}
      <div className="pb-8 sm:col-span-3 lg:col-auto">
        <a href="/" className="flex flex-col items-start">
          <div className="h4">The Crypto Frontier</div>
        </a>
        <div className="text-sm mt-4">
          <p>Explorando o futuro das criptomoedas e da tecnologia blockchain...</p>
        </div>
      </div>
      
      {/* Grupos de links */}
      <div className="pb-8">
        <h2 className="uppercase text-base tracking-wide">Explorar</h2>
        <ul className="space-y-3 mt-7">
          <li><a href="/blog" className="text-sm text-gray-700 hover:text-blue-600">Blog</a></li>
          <li><a href="/about" className="text-sm text-gray-700 hover:text-blue-600">Sobre</a></li>
          <li><a href="/services" className="text-sm text-gray-700 hover:text-blue-600">Serviços</a></li>
        </ul>
      </div>
      
      {/* Links sociais */}
      <div className="pb-6">
        <ul className="flex flex-wrap items-center">
          <li className="text-2xl mb-2 mr-8 lg:mr-12 last:mr-0">
            <a href="https://twitter.com" aria-label="Twitter">
              <svg>...</svg>
            </a>
          </li>
          {/* ... outros ícones sociais ... */}
        </ul>
      </div>
    </div>
    
    {/* Rodapé inferior */}
    <div className="border-t pt-8 mt-16 flex flex-col sm:flex-row sm:flex-wrap sm:justify-between">
      <ul className="flex flex-wrap mb-3">
        <li className="mb-1 mr-6 last:mr-0">
          <a href="/privacidade" className="text-sm">Política de Privacidade</a>
        </li>
        <li className="mb-1 mr-6 last:mr-0">
          <a href="/termos" className="text-sm">Termos de Uso</a>
        </li>
      </ul>
      <p className="text-sm mb-4 sm:order-first sm:mr-12">
        © 2023 The Crypto Frontier. Todos os direitos reservados.
      </p>
    </div>
  </div>
</footer>`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Migrado (shadcn/ui)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* Footer migrado usando componentes shadcn/ui */}
          <footer className="bg-background border-t">
            <Container>
              <div className="grid gap-8 py-10 lg:grid-cols-4 md:grid-cols-2">
                <div className="space-y-4">
                  <Link href="/" className="inline-block font-bold">
                    The Crypto Frontier
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    Explorando o futuro das criptomoedas e da tecnologia blockchain para ajudar a navegar nessa nova fronteira financeira.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Explorar</h4>
                  <nav className="flex flex-col space-y-2">
                    <Link 
                      href="/blog" 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Blog
                    </Link>
                    <Link 
                      href="/about"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Sobre
                    </Link>
                    <Link 
                      href="/services"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Serviços
                    </Link>
                  </nav>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Contato</h4>
                  <nav className="flex flex-col space-y-2">
                    <Link 
                      href="/contact"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Fale Conosco
                    </Link>
                    <Link 
                      href="/support"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Suporte
                    </Link>
                    <Link 
                      href="/faq"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      FAQ
                    </Link>
                  </nav>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Redes Sociais</h4>
                  <div className="flex space-x-4">
                    <a 
                      href="https://twitter.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Twitter"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                      </svg>
                    </a>
                    <a 
                      href="https://linkedin.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="LinkedIn"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex flex-col gap-4 py-6 md:flex-row md:justify-between md:gap-6">
                <p className="text-sm text-muted-foreground">
                  © 2023 The Crypto Frontier. Todos os direitos reservados.
                </p>
                <nav className="flex gap-4 flex-wrap">
                  <Link 
                    href="/privacidade"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Política de Privacidade
                  </Link>
                  <Link 
                    href="/termos"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Termos de Uso
                  </Link>
                </nav>
              </div>
            </Container>
          </footer>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// Footer migrado com shadcn/ui
<footer className="bg-background border-t">
  <Container>
    <div className="grid gap-8 py-10 lg:grid-cols-4 md:grid-cols-2">
      {/* Logo e descrição */}
      <div className="space-y-4">
        <Link href="/" className="inline-block font-bold">
          The Crypto Frontier
        </Link>
        <p className="text-sm text-muted-foreground">
          Explorando o futuro das criptomoedas e da tecnologia blockchain...
        </p>
      </div>
      
      {/* Links de navegação */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Explorar</h4>
        <nav className="flex flex-col space-y-2">
          <Link 
            href="/blog" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Blog
          </Link>
          {/* ... outros links ... */}
        </nav>
      </div>
      
      {/* Links de redes sociais */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm">Redes Sociais</h4>
        <div className="flex space-x-4">
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Twitter"
          >
            <svg>...</svg>
          </a>
          {/* ... outros ícones sociais ... */}
        </div>
      </div>
    </div>
    
    <Separator />
    
    {/* Rodapé com copyright e links legais */}
    <div className="flex flex-col gap-4 py-6 md:flex-row md:justify-between md:gap-6">
      <p className="text-sm text-muted-foreground">
        © 2023 The Crypto Frontier. Todos os direitos reservados.
      </p>
      <nav className="flex gap-4 flex-wrap">
        <Link 
          href="/privacidade"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Política de Privacidade
        </Link>
        {/* ... outros links ... */}
      </nav>
    </div>
  </Container>
</footer>`}</code>
        </pre>
      </div>

      <div className="p-4 border border-dashed rounded-md">
        <h3 className="text-lg font-medium mb-4">Guia de Migração</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li>Substituir o footer personalizado por um layout baseado nos componentes shadcn/ui</li>
          <li>Usar <code>Container</code> para controlar a largura máxima e o alinhamento</li>
          <li>Substituir classes CSS customizadas por tokens do design system</li>
          <li>Usar <code>Link</code> do Next.js para navegação interna</li>
          <li>Usar <code>Separator</code> para divisões visuais</li>
          <li>Aplicar classes de utilidade do Tailwind com foco em variáveis CSS do design system</li>
          <li>Adotar classes semânticas para cores (text-muted-foreground, bg-background)</li>
          <li>Implementar responsividade usando grid e flexbox com classes condicionais por breakpoint</li>
          <li>Manter acessibilidade com atributos aria-label em links de ícones</li>
        </ul>
        
        <div className="mt-4">
          <h4 className="font-medium mb-2">Benefícios da migração:</h4>
          <ul className="space-y-1 list-disc pl-5">
            <li>Melhor suporte a temas claro/escuro</li>
            <li>Consistência visual com o restante do design system</li>
            <li>Estrutura HTML mais semântica e acessível</li>
            <li>Navegação mais eficiente usando o Next.js Link</li>
            <li>Layout responsivo mais robusto</li>
            <li>Redução de código personalizado</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 
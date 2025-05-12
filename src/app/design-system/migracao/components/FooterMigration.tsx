"use client"

import React from 'react'
import Link from 'next/link'
import { Container } from '@/components/ui/container'
import { Separator } from '@/components/ui/separator'

// Componente para demonstrar o Footer moderno
export function FooterMigration() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Footer com shadcn/ui</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* Footer moderno usando componentes shadcn/ui */}
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
          <code>{`// Footer moderno com shadcn/ui
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
        <h3 className="text-lg font-medium mb-4">Características do Footer moderno</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li>Utiliza componentes shadcn/ui como Container e Separator</li>
          <li>Layout responsivo com grid e flexbox</li>
          <li>Suporte embutido para temas claro/escuro através das classes semânticas</li>
          <li>Navegação otimizada com Next.js Link</li>
          <li>Transições suaves nos efeitos de hover</li>
          <li>Estrutura HTML mais semântica e acessível</li>
          <li>Ícones de redes sociais com atributos de acessibilidade</li>
          <li>Organização clara de seções de conteúdo</li>
        </ul>
        
        <div className="mt-4">
          <h4 className="font-medium mb-2">Como usar:</h4>
          <ul className="space-y-1 list-disc pl-5">
            <li>Importe o ModernFooter em sua página ou layout</li>
            <li>Forneça os dados de navegação, links sociais e conteúdo</li>
            <li>O componente se adapta automaticamente a diferentes tamanhos de tela</li>
            <li>Fácil personalização através de props</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 
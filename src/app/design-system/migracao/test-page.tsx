import { Button } from "@/components/ui/button"
import { Badge as ShadcnBadge } from "@/components/ui/badge"
import NextLink from "next/link"
import Action from "./components/Action"
import CustomBadge from "./components/Badge"
import CustomLink from "./components/Link"

export default function MigracaoTestPage() {
  return (
    <div className="container mx-auto py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-8">Teste de Componentes Migrados</h1>
        
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Botões (Button / Action)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl mb-2">Componente shadcn/ui</h3>
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
                <h3 className="text-xl mb-2">Componente Migrado (Action)</h3>
                <div className="flex flex-wrap gap-4">
                  <Action 
                    label="Action Button" 
                    showIcon={true} 
                    icon="arrowRight" 
                    style="primary"
                    __metadata={{ modelName: 'Button' }}
                  />
                  
                  <Action 
                    label="Action Link" 
                    url="/test" 
                    showIcon={true} 
                    icon="arrowRight" 
                    iconPosition="left"
                    style="primary"
                    __metadata={{ modelName: 'Link' }}
                  />
                </div>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Badges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl mb-2">Componente shadcn/ui</h3>
                <div className="flex flex-wrap gap-4">
                  <ShadcnBadge>Default</ShadcnBadge>
                  <ShadcnBadge variant="secondary">Secondary</ShadcnBadge>
                  <ShadcnBadge variant="outline">Outline</ShadcnBadge>
                  <ShadcnBadge variant="destructive">Destructive</ShadcnBadge>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl mb-2">Componente Migrado (Badge)</h3>
                <div className="flex flex-wrap gap-4">
                  <CustomBadge label="Default Badge" color="text-primary" />
                  <CustomBadge label="Secondary Badge" color="text-secondary" />
                  <CustomBadge label="Error Badge" color="text-error" />
                  <CustomBadge label="Custom Badge" styles={{ self: { padding: '2x-small' } }} />
                </div>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-4">Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-xl mb-2">Componente shadcn/ui</h3>
                <div className="flex flex-wrap gap-4">
                  <Button variant="link" asChild>
                    <NextLink href="/">Link Interno</NextLink>
                  </Button>
                  
                  <Button variant="link" asChild>
                    <a href="https://exemplo.com" target="_blank" rel="noopener noreferrer">
                      Link Externo
                    </a>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl mb-2">Componente Migrado (Link)</h3>
                <div className="flex flex-wrap gap-4">
                  <CustomLink href="/">Link Interno</CustomLink>
                  <CustomLink href="https://exemplo.com">Link Externo</CustomLink>
                </div>
              </div>
            </div>
          </section>
          
          <div className="mt-10 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
            <h2 className="text-2xl font-semibold mb-4">Comparação Visual</h2>
            <p className="mb-4">Os componentes migrados preservam a API e o comportamento dos componentes originais, mas utilizam o sistema de design shadcn/ui para estilização e funcionalidades.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="p-4 bg-white dark:bg-gray-700 rounded-md shadow">
                <h3 className="text-lg font-medium mb-3">Action</h3>
                <Action 
                  label="Exemplo Action" 
                  url="/exemplo" 
                  showIcon={true} 
                  icon="arrowRight" 
                  __metadata={{ modelName: 'Button' }}
                />
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-700 rounded-md shadow">
                <h3 className="text-lg font-medium mb-3">Badge</h3>
                <CustomBadge label="Exemplo Badge" color="text-primary" />
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-700 rounded-md shadow">
                <h3 className="text-lg font-medium mb-3">Link</h3>
                <CustomLink href="/exemplo">Exemplo Link</CustomLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
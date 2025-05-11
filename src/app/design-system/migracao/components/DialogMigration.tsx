"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// Componente para demonstrar a migração de dialog/modal
export function DialogMigration() {
  // Estado para controlar o modal antigo
  const [legacyModalOpen, setLegacyModalOpen] = React.useState(false)

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Atual (Modal legado)</h3>
        <div className="flex flex-wrap gap-4">
          {/* Botão que abre o modal antigo */}
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => setLegacyModalOpen(true)}
          >
            Abrir Modal Legado
          </button>

          {/* Implementação de um modal simples usando apenas CSS e JS */}
          {legacyModalOpen && (
            <>
              {/* Overlay do modal */}
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setLegacyModalOpen(false)}
              />
              
              {/* Conteúdo do modal */}
              <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 z-50 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Modal Legado</h3>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setLegacyModalOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mb-6">
                  <p className="text-gray-700">
                    Este é um exemplo de modal implementado com estados e CSS básico.
                    Ele funciona, mas não possui recursos avançados como acessibilidade, 
                    foco automático, ou animações padronizadas.
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    onClick={() => setLegacyModalOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={() => setLegacyModalOpen(false)}
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// Estado para controlar o modal
const [isOpen, setIsOpen] = useState(false)

// Botão que abre o modal
<button
  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
  onClick={() => setIsOpen(true)}
>
  Abrir Modal
</button>

{/* Modal básico implementado com CSS e JS */}
{isOpen && (
  <>
    {/* Overlay */}
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={() => setIsOpen(false)}
    />
    
    {/* Conteúdo do modal */}
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 z-50 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Título do Modal</h3>
        <button onClick={() => setIsOpen(false)}>
          <svg>...</svg>
        </button>
      </div>
      <div className="mb-6">
        <p className="text-gray-700">Conteúdo do modal...</p>
      </div>
      <div className="flex justify-end">
        <button onClick={() => setIsOpen(false)}>Fechar</button>
      </div>
    </div>
  </>
)}`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Migrado (shadcn/ui Dialog)</h3>
        <div className="flex flex-wrap gap-4">
          {/* Dialog simples */}
          <Dialog>
            <DialogTrigger asChild>
              <Button>Abrir Dialog Simples</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Dialog do shadcn/ui</DialogTitle>
                <DialogDescription>
                  Dialog simples com título e descrição.
                </DialogDescription>
              </DialogHeader>
              <p className="py-4">
                Este é um exemplo de dialog usando o componente Dialog do shadcn/ui.
                Ele é acessível, possui animações e gerenciamento de foco automático.
              </p>
              <DialogFooter>
                <Button type="submit">Confirmar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Dialog com formulário */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Dialog com Formulário</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Editar Perfil</DialogTitle>
                <DialogDescription>
                  Faça alterações no seu perfil aqui. Clique em salvar quando terminar.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right text-sm font-medium">
                    Nome
                  </label>
                  <input
                    id="name"
                    className="col-span-3 h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    defaultValue="John Doe"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="username" className="text-right text-sm font-medium">
                    Username
                  </label>
                  <input
                    id="username"
                    className="col-span-3 h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    defaultValue="@johndoe"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar Alterações</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// Dialog simples do shadcn/ui
<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título do Dialog</DialogTitle>
      <DialogDescription>
        Uma breve descrição do conteúdo e propósito deste dialog.
      </DialogDescription>
    </DialogHeader>
    <p className="py-4">
      Conteúdo principal do dialog aqui...
    </p>
    <DialogFooter>
      <Button type="submit">Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}</code>
        </pre>
      </div>

      <div className="p-4 border border-dashed rounded-md">
        <h3 className="text-lg font-medium mb-4">Guia de Migração</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li>Substituir modais personalizados pelo componente <code>Dialog</code> do shadcn/ui</li>
          <li>Usar <code>DialogTrigger</code> para o elemento que abre o dialog</li>
          <li>Estruturar o conteúdo com <code>DialogContent</code>, <code>DialogHeader</code>, <code>DialogTitle</code>, <code>DialogDescription</code> e <code>DialogFooter</code></li>
          <li>Aproveitar os recursos de acessibilidade automáticos do componente</li>
          <li>Utilizar animações e transições padronizadas</li>
          <li>Não se preocupar com a implementação do overlay ou fechamento ao clicar fora</li>
          <li>Usar <code>asChild</code> para personalizar o trigger sem perder funcionalidades</li>
          <li>Para modais controlados, usar o <code>open</code> e <code>onOpenChange</code> do Dialog</li>
        </ul>
      </div>
    </div>
  )
} 
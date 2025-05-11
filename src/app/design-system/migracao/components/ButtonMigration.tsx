"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import Action from '@/components/atoms/Action'

// Exemplos de propriedades para o componente Action existente
const actionProps = {
  label: "Botão de Exemplo",
  style: "primary",
  showIcon: true,
  icon: "chevronRight",
  iconPosition: "right"
}

// Componente para demonstrar a migração de botões
export function ButtonMigration() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Atual (Action)</h3>
        <div className="flex flex-wrap gap-4">
          <Action 
            {...actionProps} 
            style="primary" 
            label="Botão Primário" 
          />
          <Action 
            {...actionProps} 
            style="secondary" 
            label="Botão Secundário" 
          />
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`<Action 
  label="Botão de Exemplo"
  style="primary"
  showIcon={true}
  icon="chevronRight"
  iconPosition="right"
/>`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Migrado (shadcn/ui Button)</h3>
        <div className="flex flex-wrap gap-4">
          <Button>
            Botão Primário
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="size-4"
            >
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </Button>
          <Button variant="secondary">
            Botão Secundário
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="size-4"
            >
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </Button>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`<Button>
  Botão Primário
  <ChevronRightIcon className="size-4" />
</Button>

<Button variant="secondary">
  Botão Secundário
  <ChevronRightIcon className="size-4" />
</Button>`}</code>
        </pre>
      </div>

      <div className="p-4 border border-dashed rounded-md">
        <h3 className="text-lg font-medium mb-4">Guia de Migração</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li>Substituir <code>Action</code> por <code>Button</code> do shadcn/ui</li>
          <li>O <code>label</code> passa a ser o conteúdo do botão</li>
          <li>O <code>style="primary"</code> é o variant padrão do Button</li>
          <li>O <code>style="secondary"</code> mapeia para <code>variant="secondary"</code></li>
          <li>Para ícones, incluir o componente SVG como filho do Button</li>
          <li>Para posicionamento à esquerda, usar classes de ordem do Tailwind</li>
        </ul>
      </div>
    </div>
  )
} 
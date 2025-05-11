"use client"

import React from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Componente para demonstrar a migração de inputs de formulário
export function FormInputMigration() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componentes Atuais (Inputs legados)</h3>
        <div className="flex flex-col space-y-4 max-w-md">
          {/* Exemplo de input de texto antigo */}
          <div className="mb-4">
            <label htmlFor="legacy-name" className="block text-sm font-medium mb-1">
              Nome
            </label>
            <input
              id="legacy-name"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite seu nome"
            />
          </div>
          
          {/* Exemplo de textarea antigo */}
          <div className="mb-4">
            <label htmlFor="legacy-message" className="block text-sm font-medium mb-1">
              Mensagem
            </label>
            <textarea
              id="legacy-message"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite sua mensagem"
            />
          </div>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// Input de texto antigo
<div className="mb-4">
  <label htmlFor="name" className="block text-sm font-medium mb-1">
    Nome
  </label>
  <input
    id="name"
    type="text"
    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    placeholder="Digite seu nome"
  />
</div>`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componentes Migrados (shadcn/ui Form)</h3>
        <div className="flex flex-col space-y-4 max-w-md">
          {/* Input de texto */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Digite seu nome" />
          </div>
          
          {/* Textarea */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea id="message" placeholder="Digite sua mensagem" />
          </div>
          
          {/* Select */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crypto">Criptomoedas</SelectItem>
                <SelectItem value="blockchain">Blockchain</SelectItem>
                <SelectItem value="defi">DeFi</SelectItem>
                <SelectItem value="nft">NFTs</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms" className="text-sm font-normal">
              Aceito os termos e condições
            </Label>
          </div>
          
          {/* Botão de submit */}
          <Button type="submit" className="mt-2">
            Enviar
          </Button>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto mt-4">
          <code>{`// Input de texto migrado
<div className="space-y-2">
  <Label htmlFor="name">Nome</Label>
  <Input id="name" placeholder="Digite seu nome" />
</div>

// Textarea migrado
<div className="space-y-2">
  <Label htmlFor="message">Mensagem</Label>
  <Textarea id="message" placeholder="Digite sua mensagem" />
</div>

// Select migrado
<div className="space-y-2">
  <Label htmlFor="category">Categoria</Label>
  <Select>
    <SelectTrigger id="category">
      <SelectValue placeholder="Selecione uma categoria" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="crypto">Criptomoedas</SelectItem>
      <SelectItem value="blockchain">Blockchain</SelectItem>
      <SelectItem value="defi">DeFi</SelectItem>
      <SelectItem value="nft">NFTs</SelectItem>
    </SelectContent>
  </Select>
</div>

// Checkbox migrado
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms" className="text-sm font-normal">
    Aceito os termos e condições
  </Label>
</div>`}</code>
        </pre>
      </div>

      <div className="p-4 border border-dashed rounded-md">
        <h3 className="text-lg font-medium mb-4">Guia de Migração</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li>Substituir inputs HTML nativos por componentes <code>Input</code>, <code>Textarea</code>, <code>Select</code> e <code>Checkbox</code> do shadcn/ui</li>
          <li>Usar o componente <code>Label</code> para labels acessíveis</li>
          <li>Organizar os campos em grupos com espaçamento consistente</li>
          <li>Aproveitar o sistema de validação e estados de erro do shadcn/ui</li>
          <li>Implementar feedbacks visuais para estados como foco, hover e disabled</li>
          <li>Manter a associação entre labels e inputs através do atributo <code>htmlFor</code></li>
          <li>Para formulários completos, utilizar o componente <code>Form</code> do shadcn/ui com react-hook-form</li>
        </ul>
      </div>
    </div>
  )
} 
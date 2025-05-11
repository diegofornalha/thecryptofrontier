"use client"

import React from 'react'
import { cn } from '@/lib/utils'

// Componente para demonstrar a migração do Bloco de Título
export function TitleBlockMigration() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Atual (TitleBlock legado)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* Versão simplificada do TitleBlock atual */}
          <div className="space-y-6">
            <h2 className="sb-component sb-component-block sb-component-title text-dark text-3xl font-bold">
              Título de exemplo
            </h2>
            
            <h2 className="sb-component sb-component-block sb-component-title text-primary text-3xl font-bold">
              Título com cor primária
            </h2>
            
            <h2 className="sb-component sb-component-block sb-component-title text-dark text-2xl font-semibold text-center">
              Título centralizado
            </h2>
          </div>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// TitleBlock atual
export default function TitleBlock(props) {
    const { className, text = [], color = 'text-dark', styles = {} } = props;
    const fieldPath = props['data-sb-field-path'];
    if (!text) {
        return null;
    }

    return (
        <h2
            className={classNames(
                'sb-component',
                'sb-component-block',
                'sb-component-title',
                color,
                className,
                styles?.self ? mapStyles(styles?.self) : undefined
            )}
            data-sb-field-path={fieldPath}
        >
            <span {...(fieldPath && { 'data-sb-field-path': '.text' })}>{text}</span>
        </h2>
    );
}`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Migrado (shadcn/ui)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* TitleBlock migrado usando typography do shadcn/ui */}
          <div className="space-y-6">
            <h2 className="scroll-m-20 text-3xl font-bold tracking-tight first:mt-0">
              Título de exemplo
            </h2>
            
            <h2 className="scroll-m-20 text-3xl font-bold tracking-tight text-primary first:mt-0">
              Título com cor primária
            </h2>
            
            <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight text-center first:mt-0">
              Título centralizado
            </h2>
          </div>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// TitleBlock migrado usando shadcn/ui
import { cn } from '@/lib/utils'

export function TitleBlock({
  text = '',
  color = 'text-foreground',
  level = 2,
  size = '3xl',
  alignment = 'left',
  className,
  styles = {},
  ...props
}) {
  // Se não houver texto, não renderizar nada
  if (!text) {
    return null;
  }

  // Determinar o alinhamento
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  // Juntar as classes
  const titleClasses = cn(
    "scroll-m-20 font-bold tracking-tight first:mt-0",
    size === '4xl' && 'text-4xl',
    size === '3xl' && 'text-3xl',
    size === '2xl' && 'text-2xl',
    size === 'xl' && 'text-xl',
    color === 'primary' && 'text-primary',
    color === 'secondary' && 'text-secondary',
    color === 'accent' && 'text-accent',
    color === 'muted' && 'text-muted-foreground',
    alignmentClasses[alignment] || 'text-left',
    styles?.margin && \`\${styles.margin}\`,
    styles?.padding && \`\${styles.padding}\`,
    className
  );

  // Criar o elemento conforme o nível
  switch (level) {
    case 1:
      return <h1 className={titleClasses} {...props}>{text}</h1>;
    case 3:
      return <h3 className={titleClasses} {...props}>{text}</h3>;
    case 4:
      return <h4 className={titleClasses} {...props}>{text}</h4>;
    case 5:
      return <h5 className={titleClasses} {...props}>{text}</h5>;
    case 6:
      return <h6 className={titleClasses} {...props}>{text}</h6>;
    case 2:
    default:
      return <h2 className={titleClasses} {...props}>{text}</h2>;
  }
}`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Guia de Migração</h3>
        <div className="p-4 bg-muted/50 rounded-md space-y-2">
          <h4 className="font-medium">Principais mudanças:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>Utilização dos tokens de tipografia do shadcn/ui (tracking-tight, scroll-m-20)</li>
            <li>Suporte mais robusto a diferentes níveis de título (h1-h6)</li>
            <li>Sistema de tamanhos consistente com o design system (xl, 2xl, 3xl, 4xl)</li>
            <li>Suporte a mais opções de cores via tokens (primary, secondary, accent, muted)</li>
            <li>Propriedade específica para alinhamento de texto</li>
            <li>Melhor semântica e acessibilidade</li>
          </ul>
          
          <h4 className="font-medium mt-4">Benefícios da migração:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>Maior consistência visual com o restante do design system</li>
            <li>Suporte automático para temas claro/escuro através dos tokens</li>
            <li>Propriedades mais intuitivas e semânticas</li>
            <li>Melhor experiência de rolagem com scroll-m-20</li>
            <li>Estilização mais precisa e previsível</li>
            <li>Facilidade de personalização respeitando o design system</li>
          </ul>
          
          <h4 className="font-medium mt-4">Considerações de implementação:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>Manter compatibilidade com as formas atuais de uso do componente</li>
            <li>Considerar a migração de conteúdo existente (cor e estilos)</li>
            <li>Oferecer guia de mapeamento de cores antigas para tokens novos</li>
            <li>Reutilizar os componentes de tipografia do design system quando possível</li>
            <li>Verificar e alinhar hierarquia visual com outros componentes de título</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 
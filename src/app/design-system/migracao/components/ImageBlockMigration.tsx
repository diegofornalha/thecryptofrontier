"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

// Componente para demonstrar a migração do Bloco de Imagem
export function ImageBlockMigration() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Atual (ImageBlock legado)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* Versão simplificada do ImageBlock atual */}
          <div className="flex flex-col items-center space-y-4">
            <div className="sb-component sb-component-block sb-component-image-block max-w-3xl">
              <img
                className="rounded-md border border-gray-300"
                src="https://via.placeholder.com/800x500"
                alt="Imagem de exemplo"
              />
            </div>
            
            <div className="sb-component sb-component-block sb-component-image-block w-full">
              <img
                className="w-full rounded-lg shadow-md"
                src="https://via.placeholder.com/1200x400"
                alt="Banner de exemplo"
              />
            </div>
          </div>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// ImageBlock atual
export default function ImageBlock(props) {
    const { elementId, className, imageClassName, url, altText = '', styles = {} } = props;
    if (!url) {
        return null;
    }
    const fieldPath = props['data-sb-field-path'];
    const annotations = fieldPath
        ? { 'data-sb-field-path': [fieldPath, \`\${fieldPath}.url#@src\`, \`\${fieldPath}.altText#@alt\`, \`\${fieldPath}.elementId#@id\`].join(' ').trim() }
        : {};

    return (
        <div
            className={classNames(
                'sb-component',
                'sb-component-block',
                'sb-component-image-block',
                className,
                styles?.self?.margin ? mapStyles({ margin: styles?.self?.margin }) : undefined
            )}
            {...annotations}
        >
            <img
                id={elementId}
                className={classNames(
                    imageClassName,
                    styles?.self?.padding ? mapStyles({ padding: styles?.self?.padding }) : undefined,
                    styles?.self?.borderWidth && styles?.self?.borderWidth !== 0 && styles?.self?.borderStyle !== 'none'
                        ? mapStyles({
                              borderWidth: styles?.self?.borderWidth,
                              borderStyle: styles?.self?.borderStyle,
                              borderColor: styles?.self?.borderColor ?? 'border-primary'
                          })
                        : undefined,
                    styles?.self?.borderRadius ? mapStyles({ borderRadius: styles?.self?.borderRadius }) : undefined
                )}
                src={url}
                alt={altText}
            />
        </div>
    );
}`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Migrado (shadcn/ui)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* Bloco de imagem migrado usando Image do Next.js e estilos do shadcn/ui */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative max-w-3xl w-full aspect-video rounded-md overflow-hidden border border-input">
              <Image
                src="https://via.placeholder.com/800x500"
                alt="Imagem de exemplo"
                fill
                className="object-cover"
              />
            </div>
            
            <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden shadow-md">
              <Image
                src="https://via.placeholder.com/1200x400"
                alt="Banner de exemplo"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// ImageBlock migrado usando Next.js Image e estilos do shadcn/ui
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function ImageBlock({
  elementId,
  className,
  imageClassName,
  url,
  altText = '',
  width,
  height,
  sizes = '100vw',
  priority = false,
  fill = false,
  aspect,
  styles = {},
  ...props
}) {
  if (!url) {
    return null;
  }

  // Calculando classes para o contêiner
  const containerClasses = cn(
    "relative",
    aspect && \`aspect-[\${aspect}]\`,
    styles?.margin && \`\${styles.margin}\`,
    className
  );

  // Calculando classes para a imagem
  const imgClasses = cn(
    "object-cover",
    styles?.borderRadius && \`rounded-\${styles.borderRadius}\`,
    styles?.borderWidth && styles?.borderStyle !== 'none' && [
      \`border-\${styles.borderWidth}\`,
      \`border-\${styles.borderStyle}\`,
      styles?.borderColor ? \`border-\${styles.borderColor}\` : 'border-input',
    ],
    styles?.padding && \`p-\${styles.padding}\`,
    imageClassName
  );

  return (
    <div className={containerClasses} id={elementId} {...props}>
      {fill ? (
        <Image
          src={url}
          alt={altText}
          fill={true}
          sizes={sizes}
          priority={priority}
          className={imgClasses}
        />
      ) : (
        <Image
          src={url}
          alt={altText}
          width={width || 1200}
          height={height || 800}
          sizes={sizes}
          priority={priority}
          className={imgClasses}
        />
      )}
    </div>
  );
}`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Guia de Migração</h3>
        <div className="p-4 bg-muted/50 rounded-md space-y-2">
          <h4 className="font-medium">Principais mudanças:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>Substituição de tag <code>img</code> por componente <code>Image</code> do Next.js</li>
            <li>Suporte para carregamento otimizado de imagens</li>
            <li>Uso de proporções (aspect ratio) com CSS moderno</li>
            <li>Utilização de tokens de cores e bordas do design system</li>
            <li>Implementação da propriedade <code>fill</code> para preenchimento responsivo</li>
            <li>Suporte para lazy loading e priorização de imagens</li>
            <li>Melhoria da semântica com atributos <code>sizes</code> e <code>priority</code></li>
          </ul>
          
          <h4 className="font-medium mt-4">Benefícios da migração:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>Performance superior com carregamento otimizado e formatação automática</li>
            <li>Menor CLS (Cumulative Layout Shift) com reserva de espaço</li>
            <li>Melhor experiência em dispositivos móveis com tamanhos responsivos</li>
            <li>Consistência visual com tokens do design system</li>
            <li>Suporte embutido para imagens WebP e AVIF</li>
            <li>Simplificação da implementação de aspect ratios</li>
          </ul>
          
          <h4 className="font-medium mt-4">Considerações de implementação:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>Necessidade de especificar <code>width</code> e <code>height</code> ou usar <code>fill</code></li>
            <li>Componente requer que imagens sejam servidas de domínios confiáveis (configuração no next.config.js)</li>
            <li>Para imagens locais, usar import estático para otimização adicional</li>
            <li>Usar <code>priority</code> para imagens above-the-fold</li>
            <li>Configurar <code>sizes</code> adequadamente para imagens responsivas</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 
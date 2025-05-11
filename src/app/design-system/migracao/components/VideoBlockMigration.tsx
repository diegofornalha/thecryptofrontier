"use client"

import React from 'react'
import { cn } from '@/lib/utils'

// Componente para demonstrar a migração do Bloco de Vídeo
export function VideoBlockMigration() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Atual (VideoBlock legado)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* Versão simplificada do VideoBlock atual */}
          <div className="space-y-6">
            <div className="sb-component sb-component-block sb-component-video-block w-full">
              <div className="overflow-hidden relative w-full h-0 pt-9/16 rounded-md">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&controls=1&loop=0&mute=0&rel=0"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute left-0 top-0 h-full w-full"
                ></iframe>
              </div>
            </div>
            
            <div className="sb-component sb-component-block sb-component-video-block w-full p-4 border rounded-md">
              <div className="overflow-hidden relative w-full h-0 pt-3/4 rounded-md">
                <iframe
                  src="https://player.vimeo.com/video/148751763?autoplay=0&controls=1&loop=0&muted=0&transparent=0"
                  title="Vimeo video player"
                  frameBorder="0"
                  allowFullScreen
                  className="absolute left-0 top-0 h-full w-full"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// VideoBlock atual (versão simplificada)
export default function VideoBlock(props) {
    const { elementId, className, url, aspectRatio = '16:9', styles = {}, ...rest } = props;
    if (!url) {
        return null;
    }
    const fieldPath = props['data-sb-field-path'];
    const annotations = fieldPath ? { 'data-sb-field-path': [fieldPath, \`\${fieldPath}.elementId#@id\`].join(' ').trim() } : {};

    return (
        <div
            id={elementId}
            className={classNames(
                'sb-component',
                'sb-component-block',
                'sb-component-video-block',
                'w-full',
                className,
                styles?.self?.padding ? mapStyles({ padding: styles?.self?.padding }) : undefined,
                styles?.self?.margin ? mapStyles({ margin: styles?.self?.margin }) : undefined,
                styles?.self?.borderWidth && styles?.self?.borderWidth !== 0 && styles?.self?.borderStyle !== 'none'
                    ? mapStyles({
                          borderWidth: styles?.self?.borderWidth,
                          borderStyle: styles?.self?.borderStyle,
                          borderColor: styles?.self?.borderColor ?? 'border-primary'
                      })
                    : undefined,
                styles?.self?.borderRadius ? mapStyles({ borderRadius: styles?.self?.borderRadius }) : undefined
            )}
            {...annotations}
        >
            <div
                className={classNames(
                    styles?.self?.borderRadius ? mapStyles({ borderRadius: styles?.self?.borderRadius }) : undefined,
                    'overflow-hidden',
                    'relative',
                    'w-full',
                    'h-0',
                    {
                        'pt-3/4': aspectRatio === '4:3',
                        'pt-9/16': aspectRatio === '16:9'
                    }
                )}
            >
                <VideoComponent url={url} {...rest} hasAnnotations={!!fieldPath} />
            </div>
        </div>
    );
}

// Componentes adicionais para diferentes tipos de vídeo (YouTube, Vimeo, MP4)
function VideoComponent(props) {
    const { url, ...rest } = props;
    const videoData = getVideoData(url);
    if (!videoData.id || !videoData.service) {
        return <p className="absolute italic left-0 text-center top-1/2 -translate-y-1/2 w-full">Video URL is not supported.</p>;
    }
    switch (videoData.service) {
        case 'youtube':
            return <YouTubeVideo id={videoData.id} {...rest} />;
        case 'vimeo':
            return <VimeoVideo id={videoData.id} {...rest} />;
        case 'custom':
            return <SelfHostedVideo url={url} id={videoData.id} {...rest} />;
        default:
            return null;
    }
}`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Componente Migrado (shadcn/ui)</h3>
        <div className="border rounded-md p-4 bg-background">
          {/* VideoBlock migrado usando componentes modernos */}
          <div className="space-y-6">
            <div className="w-full overflow-hidden rounded-md">
              <div className="relative aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&controls=1&loop=0&mute=0&rel=0"
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0 bg-muted"
                ></iframe>
              </div>
            </div>
            
            <div className="w-full overflow-hidden rounded-md p-4 border border-input bg-card">
              <div className="relative aspect-[4/3]">
                <iframe
                  src="https://player.vimeo.com/video/148751763?autoplay=0&controls=1&loop=0&muted=0&transparent=0"
                  title="Vimeo video player"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0 bg-muted"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
        <pre className="p-4 bg-muted rounded-md overflow-x-auto">
          <code>{`// VideoBlock migrado usando shadcn/ui
import React from 'react'
import { cn } from '@/lib/utils'

// Tipos de serviços de vídeo suportados
const VIDEO_SERVICES = {
  YOUTUBE: 'youtube',
  VIMEO: 'vimeo',
  CUSTOM: 'custom',
}

/**
 * Componente VideoBlock migrado para usar tokens do shadcn/ui
 */
export function VideoBlock({
  url,
  elementId,
  aspectRatio = '16:9',
  autoplay = false,
  loop = false,
  muted = false,
  controls = true,
  className,
  containerClassName,
  poster,
  styles = {},
  ...props
}) {
  if (!url) {
    return null
  }

  const videoData = getVideoData(url)
  
  // Definir classes do container
  const containerClasses = cn(
    "w-full",
    styles?.padding && \`p-\${styles.padding}\`,
    styles?.margin && \`m-\${styles.margin}\`,
    styles?.borderWidth && styles?.borderStyle !== 'none' && [
      \`border-\${styles.borderWidth}\`,
      \`border-\${styles.borderStyle || 'solid'}\`,
      styles?.borderColor ? \`border-\${styles.borderColor}\` : 'border-input',
    ],
    styles?.borderRadius && \`rounded-\${styles.borderRadius}\`,
    containerClassName
  )
  
  // Definir classes para o wrapper do vídeo
  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    '9:16': 'aspect-[9/16]',
    '21:9': 'aspect-[21/9]',
  }
  
  const videoWrapperClasses = cn(
    "relative overflow-hidden",
    aspectRatioClasses[aspectRatio] || 'aspect-video',
    styles?.borderRadius && \`rounded-\${styles.borderRadius}\`,
    className
  )
  
  // Classes comuns para os iframes/vídeos
  const mediaClasses = "absolute inset-0 h-full w-full border-0 bg-muted"
  
  return (
    <div id={elementId} className={containerClasses}>
      <div className={videoWrapperClasses}>
        {!videoData.id || !videoData.service ? (
          <p className="absolute inset-0 flex items-center justify-center italic text-muted-foreground">
            Video URL is not supported.
          </p>
        ) : videoData.service === VIDEO_SERVICES.YOUTUBE ? (
          <YouTubeEmbed 
            id={videoData.id} 
            autoplay={autoplay}
            loop={loop}
            muted={muted}
            controls={controls}
            className={mediaClasses}
          />
        ) : videoData.service === VIDEO_SERVICES.VIMEO ? (
          <VimeoEmbed 
            id={videoData.id} 
            autoplay={autoplay}
            loop={loop}
            muted={muted}
            controls={controls}
            className={mediaClasses}
          />
        ) : (
          <SelfHostedVideo 
            url={url} 
            type={videoData.id} 
            poster={poster}
            autoplay={autoplay}
            loop={loop}
            muted={muted}
            controls={controls}
            className={mediaClasses}
          />
        )}
      </div>
    </div>
  )
}

// Componente para vídeos do YouTube
function YouTubeEmbed({ id, autoplay = false, loop = false, muted = false, controls = true, className }) {
  // Construir parâmetros da URL
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    controls: controls ? '1' : '0',
    loop: loop ? '1' : '0',
    mute: muted ? '1' : '0',
    rel: '0',
    modestbranding: '1',
  }).toString()
  
  return (
    <iframe
      src={\`https://www.youtube.com/embed/\${id}?\${params}\`}
      title="YouTube video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      className={className}
    />
  )
}

// Componente para vídeos do Vimeo
function VimeoEmbed({ id, autoplay = false, loop = false, muted = false, controls = true, className }) {
  // Construir parâmetros da URL
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    controls: controls ? '1' : '0',
    loop: loop ? '1' : '0',
    muted: muted ? '1' : '0',
    transparent: '0',
    dnt: '1',
  }).toString()
  
  return (
    <iframe
      src={\`https://player.vimeo.com/video/\${id}?\${params}\`}
      title="Vimeo video player"
      allow="autoplay; fullscreen; picture-in-picture"
      allowFullScreen
      className={className}
    />
  )
}

// Componente para vídeos hospedados (MP4, WebM)
function SelfHostedVideo({ url, type, poster, autoplay = false, loop = false, muted = false, controls = true, className }) {
  return (
    <video
      autoPlay={autoplay}
      loop={loop}
      muted={muted}
      controls={controls}
      poster={poster}
      playsInline
      className={className}
    >
      <source src={url} type={type} />
      <p className="p-4 text-center">
        Seu navegador não suporta a reprodução de vídeos.
      </p>
    </video>
  )
}

// Função auxiliar para extrair ID e serviço de vídeo da URL
function getVideoData(url) {
  // Implementação da lógica para extrair ID e serviço da URL
  // Similar à implementação atual, mas simplificada
  
  let videoData = {
    id: null,
    service: null
  }
  
  // YouTube
  if (/youtube|youtu\\.be/.test(url)) {
    const id = extractYouTubeId(url)
    if (id) {
      videoData = {
        id,
        service: VIDEO_SERVICES.YOUTUBE
      }
    }
  } 
  // Vimeo
  else if (/vimeo/.test(url)) {
    const id = extractVimeoId(url)
    if (id) {
      videoData = {
        id,
        service: VIDEO_SERVICES.VIMEO
      }
    }
  } 
  // Vídeo hospedado (MP4)
  else if (/\\.mp4/.test(url)) {
    videoData = {
      id: 'video/mp4',
      service: VIDEO_SERVICES.CUSTOM
    }
  } 
  // Vídeo hospedado (WebM)
  else if (/\\.webm/.test(url)) {
    videoData = {
      id: 'video/webm',
      service: VIDEO_SERVICES.CUSTOM
    }
  }
  
  return videoData
}

// Funções auxiliares para extrair IDs de vídeo
function extractYouTubeId(url) {
  // Extrair ID de URL do YouTube
  // Ex: youtube.com/watch?v=VIDEO_ID ou youtu.be/VIDEO_ID
  const regex = /(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/)([^&\\s]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

function extractVimeoId(url) {
  // Extrair ID de URL do Vimeo
  // Ex: vimeo.com/VIDEO_ID
  const regex = /vimeo\\.com\\/(?:channels\\/(?:\\w+\\/)?|groups\\/([^\\/]*)\\/videos\\/|)(\\d+)(?:|\\/\\?)$/
  const match = url.match(regex)
  return match ? match[2] : null
}`}</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Guia de Migração</h3>
        <div className="p-4 bg-muted/50 rounded-md space-y-2">
          <h4 className="font-medium">Principais mudanças:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>Uso de <code>aspect-video</code> e outros tokens de aspect ratio do Tailwind</li>
            <li>Melhor suporte para diferentes proporções de vídeo</li>
            <li>Uso de <code>inset-0</code> em vez de posicionamento individual</li>
            <li>Utilização dos tokens de cores do design system (border-input, bg-muted)</li>
            <li>Atributos de acessibilidade aprimorados nos iframes</li>
            <li>Organização mais modular e legível dos componentes</li>
            <li>Melhor suporte para temas claro/escuro</li>
          </ul>
          
          <h4 className="font-medium mt-4">Benefícios da migração:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>Melhor desempenho com classes CSS otimizadas</li>
            <li>Visual consistente com o resto do design system</li>
            <li>Melhor compatibilidade com dispositivos móveis</li>
            <li>Resolução automática de proporções de tela</li>
            <li>Prevenção de layout shifts durante o carregamento</li>
            <li>Suporte para recursos modernos como picture-in-picture</li>
            <li>Melhor feedback visual quando o vídeo não está disponível</li>
          </ul>
          
          <h4 className="font-medium mt-4">Considerações de implementação:</h4>
          <ul className="ml-6 list-disc space-y-1">
            <li>Manter compatibilidade com a API existente para transição suave</li>
            <li>Testar em diferentes navegadores para garantir compatibilidade</li>
            <li>Considerar a adição de lazy loading para melhorar a performance</li>
            <li>Verificar o suporte a vídeos hospedados e formatos alternativos</li>
            <li>Adaptar para funcionar com diferentes provedores de CMS</li>
            <li>Adicionar opções de privacidade avançadas (DNT para Vimeo, privacy-enhanced para YouTube)</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 
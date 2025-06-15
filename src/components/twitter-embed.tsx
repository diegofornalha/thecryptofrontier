'use client'

import { useEffect } from 'react'

interface TwitterEmbedProps {
  url: string
}

export function TwitterEmbed({ url }: TwitterEmbedProps) {
  useEffect(() => {
    // Carrega o script do Twitter se ainda não estiver carregado
    if (!(window as any).twttr) {
      const script = document.createElement('script')
      script.src = 'https://platform.twitter.com/widgets.js'
      script.async = true
      script.charset = 'utf-8'
      document.body.appendChild(script)
    } else {
      // Se já carregado, recarrega os widgets
      (window as any).twttr.widgets.load()
    }
  }, [url])

  return (
    <div className="twitter-embed-container my-6 flex justify-center">
      <blockquote className="twitter-tweet" data-lang="pt" data-theme="light">
        <a href={url}>Carregando tweet...</a>
      </blockquote>
    </div>
  )
}
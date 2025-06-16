'use client';
import { useEffect } from 'react';
export function TwitterEmbed({ url }) {
    useEffect(() => {
        // Carrega o script do Twitter se ainda não estiver carregado
        if (!window.twttr) {
            const script = document.createElement('script');
            script.src = 'https://platform.twitter.com/widgets.js';
            script.async = true;
            script.charset = 'utf-8';
            document.body.appendChild(script);
        }
        else {
            // Se já carregado, recarrega os widgets
            window.twttr.widgets.load();
        }
    }, [url]);
    return (<div className="twitter-embed-container my-6 flex justify-center">
      <blockquote className="twitter-tweet" data-lang="pt" data-theme="light">
        <a href={url}>Carregando tweet...</a>
      </blockquote>
    </div>);
}

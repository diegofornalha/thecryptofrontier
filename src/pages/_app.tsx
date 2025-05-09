import React, { useEffect } from 'react';
import Head from 'next/head';
import '../css/main.css';
import SanityPreview from '../../lib/sanity/SanityPreview';

export default function MyApp({ Component, pageProps }) {
    useEffect(() => {
        // Importação dinâmica para evitar SSR
        import('react-instantsearch-dom');
    }, []);

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>The Crypto Frontier</title>
                {/* Você pode adicionar os metadados do Sanity aqui mais tarde */}
            </Head>
            <Component {...pageProps} />
            {/* Componente de Preview do Sanity */}
            <SanityPreview preview={pageProps.preview} />
        </>
    );
} 
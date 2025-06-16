/**
 * @type {import('next').NextConfig}
 */

// Detectar se estamos usando Turbopack
const isTurbopack = process.argv.includes('--turbo');

const nextConfig = {
    env: {
    },
    trailingSlash: true,
    reactStrictMode: true,
    
    // Configuração de internacionalização
    i18n: {
        locales: ['pt', 'en', 'es'],
        defaultLocale: 'pt',
        localeDetection: true,
    },
    
    images: {
        domains: ['ale-blog.agentesintegrados.com', 'localhost'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ale-blog.agentesintegrados.com',
                pathname: '/uploads/**',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '1339',
                pathname: '/uploads/**',
            }
        ],
    },


    // Ignorar erros de tipos durante o build (temporário)
    typescript: {
        ignoreBuildErrors: true,
    },

    // Desabilitar otimizações durante build (temporário para migração)
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Pular geração estática (temporário durante migração)
    experimental: {
        ppr: false,
    },

    // Output standalone para melhor compatibilidade com Netlify
    output: 'standalone'
};

module.exports = nextConfig;


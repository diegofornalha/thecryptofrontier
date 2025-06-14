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
    images: {
        domains: [''],
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


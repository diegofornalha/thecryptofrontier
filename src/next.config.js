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

    // Output standalone para melhor compatibilidade com Netlify
    output: 'standalone'
};

module.exports = nextConfig;


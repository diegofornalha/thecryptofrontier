/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    env: {
        sanityPreview: process.env.SANITY_PREVIEW || 'false',
        NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
        NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03'
    },
    trailingSlash: true,
    reactStrictMode: true,

    // Configuração de imagens para o Sanity
    images: {
        domains: ['cdn.sanity.io'],
    },

    // Resolver problemas de compatibilidade com @sanity/visual-editing
    webpack: (config, { isServer }) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@sanity/visual-editing-csm': false,
            '@sanity/visual-editing': false
        };
        return config;
    },

    // Ignorar erros de tipos durante o build (temporário)
    typescript: {
        ignoreBuildErrors: true,
    },

    // Output standalone para melhor compatibilidade com Netlify
    output: 'standalone'
};

module.exports = nextConfig;


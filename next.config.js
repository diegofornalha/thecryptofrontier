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

    // Adicionando webpack config para incluir o patch de preload e resolver problemas de compatibilidade
    webpack: (config, { isServer }) => {
        if (!isServer) {
            // Adicionando nosso patch como entry point
            const originalEntry = config.entry;
            config.entry = async () => {
                const entries = await originalEntry();
                // Adicionando nosso patch antes de qualquer outro JavaScript
                if (entries['main.js'] && !entries['main.js'].includes('./preload-patch.js')) {
                    entries['main.js'].unshift('./preload-patch.js');
                }
                return entries;
            };
        }

        // Resolver problemas de compatibilidade com @sanity/visual-editing-csm
        config.resolve.alias = {
            ...config.resolve.alias,
            '@sanity/visual-editing-csm': false,
            '@sanity/visual-editing': false
        };

        return config;
    },
    // Forçar o uso do Pages Router, desativando o App Router
    // useFileSystemPublicRoutes: true, // COMENTADO para permitir App Router
    // Configuração de imagens para o Sanity
    images: {
        domains: ['cdn.sanity.io', 'images.cointelegraph.com', 's3.cointelegraph.com'],
    },
    // Configuração de redirecionamentos
    async redirects() {
        return [];
    },
    // Configuração de reescrita de URLs
    async rewrites() {
        return [];
    },
    // Ignorar erros de tipos durante o build
    typescript: {
        ignoreBuildErrors: true,
    }
};

module.exports = nextConfig;

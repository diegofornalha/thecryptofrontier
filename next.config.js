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
        return [
            // Redirecionar artigos de subpastas como /mcpx/databutton/o-que-e-databutton/ para /mcpx/o-que-e-databutton/
            {
                source: '/mcpx/:subfolder/o-que-e-:slug/',
                destination: '/mcpx/o-que-e-:slug/',
                permanent: true,
            },
            // Exemplo específico para Databutton
            {
                source: '/mcpx/databutton/o-que-e-databutton/',
                destination: '/mcpx/o-que-e-databutton/',
                permanent: true,
            },
            // Redirecionar /mcpx/ml/introducao-ao-ml/ para /mcpx/introducao-ao-ml/
            {
                source: '/mcpx/ml/introducao-ao-ml/:path*',
                destination: '/mcpx/introducao-ao-ml/:path*',
                permanent: true,
            },
            // Redirecionar /mcpx/ para a home
            {
                source: '/mcpx/',
                destination: '/',
                permanent: true,
            },
            // Redirecionar de /content/mcpx/... para /mcpx/...
            {
                source: '/content/mcpx/:path*',
                destination: '/mcpx/:path*',
                permanent: true,
            },
            // Redirecionar de /mcpx/... para /content/mcpx/... (para fins de compatibilidade interna)
            {
                source: '/mcpx/:path*',
                destination: '/content/mcpx/:path*',
                permanent: false,
                has: [
                    {
                        type: 'header',
                        key: 'x-nextjs-data',
                        value: '1',
                    },
                ],
            },
            // Regras para pasta docker
            // Redirecionar de /content/docker/... para /docker/...
            {
                source: '/content/docker/:path*',
                destination: '/docker/:path*',
                permanent: true,
            },
            // Redirecionar de /docker/... para /content/docker/... (para fins de compatibilidade interna)
            {
                source: '/docker/:path*',
                destination: '/content/docker/:path*',
                permanent: false,
                has: [
                    {
                        type: 'header',
                        key: 'x-nextjs-data',
                        value: '1',
                    },
                ],
            },
        ];
    },
    // Configuração de reescrita de URLs (alternativa ao redirecionamento)
    async rewrites() {
        return [
            // Reescrever /mcpx/... para /content/mcpx/... (sem redirecionamento visível)
            {
                source: '/mcpx/:path*',
                destination: '/content/mcpx/:path*',
            },
            // Reescrever /docker/... para /content/docker/... (sem redirecionamento visível)
            {
                source: '/docker/:path*',
                destination: '/content/docker/:path*',
            },
            // Adicionar reescrita para API Webhook do Sanity
            {
                source: '/api/sanity-webhook',
                destination: '/api/sanity-webhook',
            },
        ];
    },
    // Ignorar erros de tipos durante o build
    typescript: {
        ignoreBuildErrors: true,
    }
};

module.exports = nextConfig;

import FeaturedBanner from '@/components/sections/home/FeaturedBanner';
const meta = {
    title: 'Sections/Home/FeaturedBanner',
    component: FeaturedBanner,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'Banner principal que pode exibir conteúdo publicitário (AdBanner) ou o último post do blog (Banner editorial). Alterna entre os dois modos através da prop showAd.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        showAd: {
            control: 'boolean',
            description: 'Se deve mostrar publicidade (true) ou conteúdo editorial (false)',
        },
        adConfig: {
            control: 'object',
            description: 'Configuração do banner publicitário quando showAd=true',
        },
    },
};
export default meta;
export const ModoPublicitario = {
    args: {
        showAd: true,
        adConfig: {
            title: 'Sinais Cripto Expert',
            subtitle: 'Lucre de R$ 500,00 a R$ 5.000 em média por dia no criptomercado, sem precisar olhar gráficos, notícias, nem fazer cursos enormes.',
            link: 'https://eternityscale.com.br/sce-blog/',
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Modo padrão - exibe banner publicitário com animações de Bitcoin e foguete.',
            },
        },
    },
};
export const ModoEditorial = {
    args: {
        showAd: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'Modo editorial - busca e exibe o último post publicado no blog. Se não houver posts, exibe um banner de fallback.',
            },
        },
    },
};
export const PublicitarioCustomizado = {
    args: {
        showAd: true,
        adConfig: {
            title: 'Curso Completo de DeFi',
            subtitle: 'Aprenda a investir em finanças descentralizadas com segurança. Vagas limitadas!',
            link: '/cursos/defi-completo',
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Banner publicitário com conteúdo customizado.',
            },
        },
    },
};
export const PublicitarioSemAnimacao = {
    args: {
        showAd: true,
        adConfig: {
            title: 'Newsletter Crypto Insights',
            subtitle: 'Receba análises diárias do mercado cripto no seu email.',
            link: '/newsletter',
        },
    },
    parameters: {
        docs: {
            description: {
                story: 'Exemplo de como seria o banner publicitário sem as animações (necessitaria prop adicional no AdBanner).',
            },
        },
    },
};
export const Mobile = {
    args: {
        showAd: true,
        adConfig: {
            title: 'Oferta Mobile Especial',
            subtitle: 'Aproveite 50% de desconto no primeiro mês.',
            link: 'https://example.com/oferta',
        },
    },
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
        docs: {
            description: {
                story: 'Visualização mobile do FeaturedBanner.',
            },
        },
    },
};
export const Tablet = {
    args: {
        showAd: false,
    },
    parameters: {
        viewport: {
            defaultViewport: 'tablet',
        },
        docs: {
            description: {
                story: 'Visualização tablet do FeaturedBanner em modo editorial.',
            },
        },
    },
};

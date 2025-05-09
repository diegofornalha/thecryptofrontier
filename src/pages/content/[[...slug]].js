import React from 'react';
import Head from 'next/head';
import { allContent } from '../../utils/local-content';
import { getComponent } from '../../components/components-registry';
import { resolveStaticProps } from '../../utils/static-props-resolvers';
import { resolveStaticPaths } from '../../utils/static-paths-resolvers';
import { seoGenerateTitle, seoGenerateMetaTags, seoGenerateMetaDescription } from '../../utils/seo-utils';

function Page(props) {
    const { page, site } = props;
    const { modelName } = page.__metadata;
    if (!modelName) {
        throw new Error(`page has no type, page '${props.path}'`);
    }
    const PageLayout = getComponent(modelName);
    if (!PageLayout) {
        throw new Error(`no page layout matching the page model: ${modelName}`);
    }
    const title = seoGenerateTitle(page, site);
    const metaTags = seoGenerateMetaTags(page, site);
    const metaDescription = seoGenerateMetaDescription(page, site);
    return (
        <>
            <Head>
                <title>{title}</title>
                {metaDescription && <meta name="description" content={metaDescription} />}
                {metaTags.map((metaTag) => {
                    if (metaTag.format === 'property') {
                        // OpenGraph meta tags (og:*) should be have the format <meta property="og:…" content="…">
                        return <meta key={metaTag.property} property={metaTag.property} content={metaTag.content} />;
                    }
                    return <meta key={metaTag.property} name={metaTag.property} content={metaTag.content} />;
                })}
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                {site.favicon && <link rel="icon" href={site.favicon} />}
            </Head>
            <PageLayout page={page} site={site} />
        </>
    );
}

export function getStaticPaths() {
    const data = allContent();
    const paths = resolveStaticPaths(data);
    
    console.log('Paths brutos:', JSON.stringify(paths, null, 2));
    
    // Mapeando os paths e tratando casos onde params pode ser undefined
    const adjustedPaths = paths.map(path => {
        // Se o path for uma string, converter para o formato correto
        if (typeof path === 'string') {
            // Remover o prefixo / se existir
            const cleanPath = path.replace(/^\//, '');
            // Dividir o path em partes
            const parts = cleanPath.split('/');
            
            console.log('Path processado:', {
                original: path,
                parts: parts
            });
            
            return {
                params: {
                    slug: parts
                }
            };
        }
        
        // Se já for um objeto com params, usar diretamente
        if (path.params) {
            const slugArray = Array.isArray(path.params.slug) ? path.params.slug : 
                             path.params.slug ? [path.params.slug] : [];
            
            console.log('Path com params:', {
                original: path,
                slugArray: slugArray
            });
            
            return {
                params: {
                    slug: slugArray
                }
            };
        }
        
        // Caso padrão
        console.log('Path padrão:', path);
        return {
            params: {
                slug: ['content']
            }
        };
    });

    console.log('Paths finais:', JSON.stringify(adjustedPaths, null, 2));
    return { paths: adjustedPaths, fallback: false };
}

export async function getStaticProps({ params }) {
    const data = allContent();
    
    // Tratamento seguro do slug
    const slugArray = params?.slug || [];
    let urlPath = '/' + slugArray.join('/');
    
    console.log('🔍 Debug 404:', {
        params: params,
        slugArray: slugArray,
        urlPath: urlPath,
        availablePages: data.pages.map(p => ({
            type: p.__metadata?.modelName,
            slug: p.slug,
            urlPath: p.__metadata?.urlPath
        }))
    });
    
    // Se o path não começa com /content/, adicionar o prefixo
    if (!urlPath.startsWith('/content/')) {
        console.log('🔄 Adicionando prefixo /content/ ao path:', urlPath);
        urlPath = '/content' + urlPath;
    }
    
    console.log('🔍 Tentando gerar página para:', {
        finalUrlPath: urlPath,
        availableUrls: data.pages.map(p => p.__metadata?.urlPath)
    });
    
    const props = await resolveStaticProps(urlPath, data);
    
    console.log('📦 Resultado da geração:', {
        hasPage: !!props?.page,
        pageType: props?.page?.__metadata?.modelName,
        pageSlug: props?.page?.slug,
        pageUrlPath: props?.page?.__metadata?.urlPath
    });
    
    if (!props?.page) {
        console.log('❌ 404: Página não encontrada para:', urlPath);
        return {
            notFound: true,
            props: {
                page: null,
                site: {} // Garante que site sempre tenha um valor válido
            }
        };
    }
    
    // Garante que site sempre tenha um valor válido
    const site = props.page.site || {};
    
    return { props };
}

export default Page; 
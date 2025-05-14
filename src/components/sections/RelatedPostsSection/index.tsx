import React, { useEffect, useState } from 'react';
import { mapStylesToClassNames as mapStyles } from '../../../utils/map-styles-to-class-names';
import Section from '../Section';
import Link from '../../atoms/Link';
import { ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY, buildIndexName } from '../../../utils/indexer/consts';
import algoliasearch from 'algoliasearch/lite';
import * as React from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import client from '../../../lib/sanityClient';

// Verifica se as credenciais do Algolia estão disponíveis
const hasAlgoliaCredentials = ALGOLIA_APP_ID && ALGOLIA_SEARCH_API_KEY;

// Cria um cliente de pesquisa mockado se as credenciais não estiverem disponíveis
const searchClient = hasAlgoliaCredentials 
  ? algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY)
  : { 
      search: () => Promise.resolve({ 
        results: [{ hits: [] }] 
      }),
      appId: 'mock-app-id',
      addAlgoliaAgent: () => {}
    };

export default function RelatedPostsSection(props) {
    const {
        type,
        elementId,
        colors,
        title,
        subtitle,
        posts = [],
        showThumbnail = true,
        showExcerpt = true,
        showDate = true,
        showAuthor = false,
        variant = 'variant-a',
        actions = [],
        styles = {},
        'data-sb-field-path': fieldPath,
        currentPostCategories = [], // categorias do post atual
        currentPostSlug = '', // slug do post atual para evitar que ele apareça nos relacionados
        limit = 3, // número máximo de posts relacionados
        className,
        sortBy = 'date',
        sortOrder = 'desc',
        enableAnnotations = true
    } = props;

    const [isLoading, setIsLoading] = useState(true);
    const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
    const [showAuthorConfig, setShowAuthorConfig] = useState(showAuthor);
    const [showDateConfig, setShowDateConfig] = useState(showDate);

    useEffect(() => {
        const fetchRelatedPosts = async () => {
            if (!hasAlgoliaCredentials || !currentPostCategories || currentPostCategories.length === 0) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                
                // Monta a query para buscar posts com categorias semelhantes
                const indexName = buildIndexName() || 'default_posts';
                const results = await searchClient.search([
                    {
                        indexName,
                        query: '',
                        params: {
                            // Filtra para encontrar posts que tenham pelo menos uma das categorias
                            facetFilters: [
                                currentPostCategories.map(category => `categories:${category}`)
                            ],
                            // Exclui o post atual
                            filters: `NOT slug:${currentPostSlug}`,
                            hitsPerPage: limit
                        }
                    }
                ]);

                // Usando uma verificação de tipo segura para acessar os hits
                const searchResults = results.results[0];
                const hits = searchResults && 'hits' in searchResults ? searchResults.hits || [] : [];
                setRelatedPosts(hits);
            } catch (error) {
                console.error('Erro ao buscar posts relacionados:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRelatedPosts();
    }, [currentPostCategories, currentPostSlug, limit]);

    useEffect(() => {
        async function fetchBlogConfig() {
            try {
                const config = await client.fetch(`*[_type == "blogConfig"][0]{
                    hideAuthorOnPosts,
                    hideDateOnPosts
                }`);
                
                if (config) {
                    setShowAuthorConfig(!config.hideAuthorOnPosts);
                    setShowDateConfig(!config.hideDateOnPosts);
                }
            } catch (error) {
                console.error('Erro ao buscar configurações do blog:', error);
            }
        }
        
        fetchBlogConfig();
    }, []);

    // Se não houver credenciais ou se os posts fornecidos manualmente estiverem disponíveis, use-os
    const postsToDisplay = posts && posts.length > 0 ? posts : relatedPosts;

    // Se estiver carregando ou não houver posts relacionados, não renderize a seção
    if (isLoading || postsToDisplay.length === 0) {
        return null;
    }

    const cssClasses = {
        container: classNames('sb-component', 'sb-component-section', 'sb-component-featured-posts-section', className),
        title: classNames('sb-component-section-title'),
        subtitle: classNames('sb-component-section-subtitle'),
    };

    return (
        <Section type={type} elementId={elementId} colors={colors} styles={styles.self} className={cssClasses.container} data-sb-field-path={fieldPath}>
            {title && (
                <h2 className={cssClasses.title} data-sb-field-path=".title">
                    {title}
                </h2>
            )}
            {subtitle && (
                <div className={cssClasses.subtitle} data-sb-field-path=".subtitle">
                    {subtitle}
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {postsToDisplay.map((post, index) => {
                    const isAlgoliaPost = !post.slug; // Se não tiver slug, é um post do Algolia
                    
                    // Adaptando dados para compatibilidade
                    const postItem = isAlgoliaPost ? {
                        title: post.title,
                        slug: post.url?.replace(/^\//, '') || '',
                        date: post.date,
                        featuredImage: post.featuredImage ? { 
                            url: post.featuredImage,
                            altText: post.title
                        } : null,
                        excerpt: post.excerpt,
                        author: post.authorName ? {
                            name: post.authorName,
                            image: post.authorImage ? {
                                url: post.authorImage
                            } : null
                        } : null
                    } : post;

                    return (
                        <div
                            key={index}
                            className={classNames(
                                'flex flex-1 relative rounded-md bg-white text-dark dark:bg-dark-card dark:text-light',
                                'flex-col space-y-4 overflow-hidden pb-8 h-full mx-4',
                                'min-w-[300px] md:min-w-[300px] lg:min-w-[300px]',
                                'transform transition-transform duration-300 hover:shadow-lg hover:-translate-y-1'
                            )}
                            {...(enableAnnotations && { 'data-sb-field-path': `.items.${index}` })}
                        >
                            {showThumbnail && postItem.featuredImage?.url && (
                                <Link href={postItem.slug} className="block h-0 w-full pt-2/3 relative overflow-hidden">
                                    <img
                                        className="absolute top-0 left-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                                        src={postItem.featuredImage.url}
                                        alt={postItem.featuredImage.altText || ''}
                                        data-sb-field-path=".featuredImage.url#@src .featuredImage.altText#@alt"
                                    />
                                </Link>
                            )}
                            <div className="flex flex-col flex-grow px-4 pt-4 pb-8 bg-gray-100 dark:bg-gray-800">
                                <h3 className="text-lg font-medium leading-6 mb-2">
                                    <Link
                                        href={postItem.slug}
                                        className="hover:text-primary"
                                        data-sb-field-path=".title .slug#@href"
                                    >
                                        {postItem.title}
                                    </Link>
                                </h3>
                                <div className="flex-grow">
                                    {showExcerpt && postItem.excerpt && (
                                        <p className="text-sm mb-4 text-gray-500 dark:text-gray-400" data-sb-field-path=".excerpt">
                                            {postItem.excerpt}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center text-sm">
                                    {showAuthorConfig && postItem.author && (
                                        <div className="flex items-center mr-3">
                                            {postItem.author.image && (
                                                <img
                                                    className="w-6 h-6 rounded-full mr-1 object-cover"
                                                    src={postItem.author.image.url}
                                                    alt={postItem.author.name}
                                                    data-sb-field-path=".author.image.url#@src .author.name#@alt"
                                                />
                                            )}
                                            <span data-sb-field-path=".author.name">{postItem.author.name}</span>
                                        </div>
                                    )}
                                    {showDateConfig && postItem.date && (
                                        <time className="text-gray-500 dark:text-gray-400" dateTime={postItem.date} data-sb-field-path=".date" suppressHydrationWarning>
                                            {formatDate(postItem.date)}
                                        </time>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {actions && actions.length > 0 && (
                <div className="mt-10 flex flex-wrap justify-center gap-4" data-sb-field-path=".actions">
                    {actions.map((action, index) => (
                        <a 
                            key={index} 
                            href={action.url} 
                            className={`mb-0 lg:mb-0 ${action.className || ''}`} 
                            data-sb-field-path={`.${index}`}
                        >
                            {action.label}
                        </a>
                    ))}
                </div>
            )}
        </Section>
    );
}

// Import utility for date formatting
import { formatDate as formatDateUtil } from '../../../utils/date-utils';

function formatDate(date) {
    if (!date) {
        return '';
    }
    return formatDateUtil(date);
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
} 
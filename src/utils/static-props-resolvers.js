import {
    getRootPagePath,
    resolveReferences,
    getAllPostsSorted,
    getAllNonFeaturedPostsSorted,
    getAllCategoryPostsSorted,
    getPagedItemsForPage,
    isPublished,
    mapDeepAsync
} from './data-utils';

export async function resolveStaticProps(urlPath, data) {
    console.log('🔍 resolveStaticProps:', {
        urlPath: urlPath,
        availablePages: data.pages.map(p => ({
            type: p.__metadata?.modelName,
            slug: p.slug,
            urlPath: p.__metadata?.urlPath
        }))
    });

    const rootPath = getRootPagePath(urlPath);
    console.log('📂 Root path:', rootPath);

    const page = data.pages.find((page) => page.__metadata?.urlPath === rootPath);
    console.log('📄 Página encontrada:', {
        exists: !!page,
        type: page?.__metadata?.modelName,
        slug: page?.slug,
        urlPath: page?.__metadata?.urlPath
    });

    if (!page) {
        console.log('❌ Página não encontrada para rootPath:', rootPath);
        return null;
    }

    // Adicionando um autor padrão se for PostLayout
    if (page.__metadata?.modelName === 'PostLayout' && !page.author) {
        const defaultAuthor = data.objects.find((obj) => obj.__metadata?.id === 'content/data/diegofornalha.json');
        if (defaultAuthor) {
            page.author = 'content/data/diegofornalha.json';
        }
    }

    const props = {
        page: page,
        site: data.site || {}
    };

    console.log('🔄 Resolvendo referências para:', {
        type: page.__metadata?.modelName,
        slug: page.slug
    });

    const resolvedProps = await mapDeepAsync(props, async (value) => {
        if (value && value.__metadata && value.__metadata.modelName) {
            console.log('🔗 Resolvendo referência:', {
                type: value.__metadata.modelName,
                id: value.__metadata.id
            });
            return resolveReferences(value, ['author', 'category'], data.objects);
        }
        return value;
    });

    console.log('✅ Props resolvidas:', {
        hasPage: !!resolvedProps.page,
        pageType: resolvedProps.page?.__metadata?.modelName,
        pageSlug: resolvedProps.page?.slug
    });

    return resolvedProps;
}

const StaticPropsResolvers = {
    PostLayout: (props, data, debugContext) => {
        return resolveReferences(props, ['author', 'category'], data.objects, debugContext);
    },
    PostFeedLayout: (props, data) => {
        const numOfPostsPerPage = props.numOfPostsPerPage ?? 10;
        let allPosts = getAllNonFeaturedPostsSorted(data.objects);
        if (!process.env.stackbitPreview) {
            allPosts = allPosts.filter(isPublished);
        }
        const paginationData = getPagedItemsForPage(props, allPosts, numOfPostsPerPage);
        const items = resolveReferences(paginationData.items, ['author', 'category'], data.objects);
        return {
            ...props,
            ...paginationData,
            items
        };
    },
    PostFeedCategoryLayout: (props, data) => {
        const categoryId = props.__metadata?.id;
        const numOfPostsPerPage = props.numOfPostsPerPage ?? 10;
        let allCategoryPosts = getAllCategoryPostsSorted(data.objects, categoryId);
        if (!process.env.stackbitPreview) {
            allCategoryPosts = allCategoryPosts.filter(isPublished);
        }
        const paginationData = getPagedItemsForPage(props, allCategoryPosts, numOfPostsPerPage);
        const items = resolveReferences(paginationData.items, ['author', 'category'], data.objects);
        return {
            ...props,
            ...paginationData,
            items
        };
    },
    RecentPostsSection: (props, data) => {
        let allPosts = getAllPostsSorted(data.objects);
        if (!process.env.stackbitPreview) {
            allPosts = allPosts.filter(isPublished);
        }
        allPosts = allPosts.slice(0, props.recentCount || 6);
        const recentPosts = resolveReferences(allPosts, ['author', 'category'], data.objects);
        return {
            ...props,
            posts: recentPosts
        };
    },
    FeaturedPostsSection: (props, data, debugContext) => {
        return resolveReferences(props, ['posts.author', 'posts.category'], data.objects, debugContext);
    },
    FeaturedPeopleSection: (props, data, debugContext) => {
        return resolveReferences(props, ['people'], data.objects, debugContext);
    }
};

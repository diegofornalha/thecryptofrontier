import { getAllNonFeaturedPostsSorted, getAllCategoryPostsSorted, generatePagedPathsForPage, isPublished } from './data-utils';

export function resolveStaticPaths({ pages, objects }) {
    console.log('📄 Páginas disponíveis:', pages.map(p => ({
        type: p.__metadata?.modelName,
        slug: p.slug,
        urlPath: p.__metadata?.urlPath
    })));
    
    return pages.reduce((paths, page) => {
        if (!process.env.stackbitPreview && page.isDraft) {
            return paths;
        }
        const objectType = page.__metadata?.modelName;
        const pageUrlPath = page.__metadata?.urlPath;
        console.log(`🛣️ Processando página:`, {
            type: objectType,
            urlPath: pageUrlPath
        });
        
        if (objectType && StaticPathsResolvers[objectType]) {
            const resolver = StaticPathsResolvers[objectType];
            const resolvedPaths = resolver(page, objects);
            console.log(`📌 Paths resolvidos para ${objectType}:`, resolvedPaths);
            return paths.concat(resolvedPaths);
        }
        
        // Para PostLayout, gerar tanto o path antigo quanto o novo
        if (objectType === 'PostLayout') {
            const oldPath = pageUrlPath.replace('/content/', '/');
            console.log(`📌 Paths para PostLayout:`, [oldPath, pageUrlPath]);
            return paths.concat([oldPath, pageUrlPath]);
        }
        
        console.log(`📌 Path direto:`, pageUrlPath);
        return paths.concat(pageUrlPath);
    }, []);
}

const StaticPathsResolvers = {
    PostFeedLayout: (page, objects) => {
        let posts = getAllNonFeaturedPostsSorted(objects);
        if (!process.env.stackbitPreview) {
            posts = posts.filter(isPublished);
        }
        const numOfPostsPerPage = page.numOfPostsPerPage ?? 10;
        return generatePagedPathsForPage(page, posts, numOfPostsPerPage);
    },
    PostFeedCategoryLayout: (page, objects) => {
        const categoryId = page.__metadata?.id;
        const numOfPostsPerPage = page.numOfPostsPerPage ?? 10;
        let categoryPosts = getAllCategoryPostsSorted(objects, categoryId);
        if (!process.env.stackbitPreview) {
            categoryPosts = categoryPosts.filter(isPublished);
        }
        return generatePagedPathsForPage(page, categoryPosts, numOfPostsPerPage);
    }
};

import { defineStackbitConfig, DocumentStringLikeFieldNonLocalized, SiteMapEntry } from '@stackbit/types';
import { GitContentSource } from '@stackbit/cms-git';
import { allModels } from 'sources/local/models';

const gitContentSource = new GitContentSource({
    rootPath: __dirname,
    contentDirs: ['content'],
    models: Object.values(allModels),
    assetsConfig: {
        referenceType: 'static',
        staticDir: 'public',
        uploadDir: 'images',
        publicPath: '/'
    }
});

export const config = defineStackbitConfig({
    stackbitVersion: '~0.7.0',
    ssgName: 'nextjs',
    nodeVersion: '18',
    styleObjectModelName: 'ThemeStyle',
    customContentReload: false,
    models: {
        page: { type: 'page', urlPath: '/{slug}' },
        post: { type: 'page', urlPath: '/mcpx/{slug}' }
    },
    contentSources: [gitContentSource],
    presetSource: {
        type: 'files',
        presetDirs: ['sources/local/presets']
    },
    siteMap: ({ documents, models }): SiteMapEntry[] => {
        const pageModels = models.filter((model) => model.type === 'page').map((model) => model.name);
        return documents
            .filter((document) => pageModels.includes(document.modelName))
            .map((document) => {
                let slug = (document.fields.slug as DocumentStringLikeFieldNonLocalized)?.value;
                if (!slug) return null;
                slug = slug.replace(/^\/+/, '');
                switch (document.modelName) {
                    case 'PostFeedLayout':
                        return {
                            urlPath: '/mcpx',
                            document: document
                        };
                    case 'PostLayout':
                        return {
                            urlPath: `/mcpx/${slug}`,
                            document: document
                        };
                    default:
                        return {
                            urlPath: `/${slug}`,
                            document: document
                        };
                }
            });
    }
});

export default config;

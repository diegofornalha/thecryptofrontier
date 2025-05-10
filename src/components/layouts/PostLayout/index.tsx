import * as React from 'react';
import dayjs from 'dayjs';
import Markdown from 'markdown-to-jsx';

import { getBaseLayoutComponent } from '../../../utils/base-layout';
import { getComponent } from '../../components-registry';
import Link from '../../atoms/Link';
import RelatedPostsSection from '../../sections/RelatedPostsSection';
import SocialShare from '../../atoms/SocialShare';

export default function PostLayout(props) {
    const { page, site } = props;
    const BaseLayout = getBaseLayoutComponent(page.baseLayout, site.baseLayout);
    const { enableAnnotations = true } = site;
    const { title, date, author = null, markdown_content, bottomSections = [], categories = [], slug } = page;
    const dateTimeAttr = dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    // URL completa do post para compartilhamento
    const siteUrl = site.siteUrl || 'https://thecryptofrontier.agentesintegrados.com';
    const postUrl = `${siteUrl}/post/${slug}`;

    return (
        <BaseLayout page={page} site={site}>
            <main id="main" className="sb-layout sb-post-layout">
                <article className="px-4 py-16 sm:py-28">
                    <div className="mx-auto max-w-screen-2xl">
                        <header className="max-w-4xl mx-auto mb-12 text-center">
                            <h1 {...(enableAnnotations && { 'data-sb-field-path': 'title' })}>{title}</h1>
                            <div className="mt-4 text-sm uppercase">
                                <time dateTime={dateTimeAttr} {...(enableAnnotations && { 'data-sb-field-path': 'date' })}>
                                    {formattedDate}
                                </time>
                                {author && (
                                    <>
                                        <span className="mx-2">|</span>
                                        <PostAuthor author={author} enableAnnotations={enableAnnotations} />
                                    </>
                                )}
                            </div>
                        </header>
                        {markdown_content && (
                            <Markdown
                                options={{ forceBlock: true }}
                                className="max-w-3xl mx-auto sb-markdown"
                                {...(enableAnnotations && { 'data-sb-field-path': 'markdown_content' })}
                            >
                                {markdown_content}
                            </Markdown>
                        )}
                    </div>
                </article>
                
                {/* Related Posts Section - Adicionado automaticamente */}
                {categories && categories.length > 0 && (
                    <RelatedPostsSection
                        title="Posts Relacionados"
                        colors={page.colors || 'bg-light-fg-dark'}
                        currentPostCategories={categories}
                        currentPostSlug={slug}
                        limit={3}
                    />
                )}
                
                {bottomSections.length > 0 && (
                    <div {...(enableAnnotations && { 'data-sb-field-path': 'bottomSections' })}>
                        {bottomSections.map((section, index) => {
                            const Component = getComponent(section.__metadata.modelName);
                            if (!Component) {
                                throw new Error(`no component matching the page section's model name: ${section.__metadata.modelName}`);
                            }
                            return (
                                <Component
                                    key={index}
                                    {...section}
                                    enableAnnotations={enableAnnotations}
                                    {...(enableAnnotations && { 'data-sb-field-path': `bottomSections.${index}` })}
                                />
                            );
                        })}
                    </div>
                )}
                
                {/* Seção de compartilhamento social no final da postagem */}
                <div className="mx-auto max-w-screen-2xl px-4 pb-16">
                    <div className="max-w-3xl mx-auto mt-12 border-t border-b py-6 bg-gray-50 rounded-lg shadow-sm">
                        <h3 className="text-center mb-4 font-medium">Gostou deste artigo? Compartilhe!</h3>
                        <SocialShare 
                            title={title} 
                            url={postUrl} 
                            enableAnnotations={enableAnnotations} 
                            className="justify-center"
                        />
                    </div>
                </div>
            </main>
        </BaseLayout>
    );
}

function PostAuthor({ author, enableAnnotations }) {
    if (!author || typeof author !== 'object') {
        return null;
    }
    
    const authorName = author.name && <span {...(enableAnnotations && { 'data-sb-field-path': '.name' })}>{author.name}</span>;
    return author.slug ? (
        <Link {...(enableAnnotations && { 'data-sb-field-path': 'author' })} href={`/mcpx/author/${author.slug}`}>
            {authorName}
        </Link>
    ) : (
        <span {...(enableAnnotations && { 'data-sb-field-path': 'author' })}>{authorName}</span>
    );
}

/*
function PostCategory({ category, enableAnnotations }) {
    if (!category) {
        return null;
    }
    return (
        <div className="mb-4">
            <Link {...(enableAnnotations && { 'data-sb-field-path': 'category' })} href={category.__metadata?.urlPath}>
                {category.title}
            </Link>
        </div>
    );
}
*/

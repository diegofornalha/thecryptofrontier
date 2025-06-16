import React from 'react';
import PopularPostItem from './popular-post-item';
import strapiClient from "@/lib/strapiClient";
// Server Component
export default async function PopularPostsWidget() {
    let posts = [];
    try {
        const response = await strapiClient.getPosts({
            pageSize: 5,
            sort: 'publishedAt:desc',
            status: 'published'
        });
        if (response.data) {
            posts = response.data.map((post) => {
                var _a, _b, _c, _d, _e;
                return ({
                    id: post.id || post._id,
                    title: ((_a = post.attributes) === null || _a === void 0 ? void 0 : _a.title) || post.title || '',
                    slug: ((_b = post.attributes) === null || _b === void 0 ? void 0 : _b.slug) || post.slug || '',
                    publishedAt: ((_c = post.attributes) === null || _c === void 0 ? void 0 : _c.publishedAt) || post.publishedAt,
                    createdAt: ((_d = post.attributes) === null || _d === void 0 ? void 0 : _d.createdAt) || post.createdAt,
                    content: ((_e = post.attributes) === null || _e === void 0 ? void 0 : _e.content) || post.content || ''
                });
            });
        }
    }
    catch (error) {
        console.error('Erro ao buscar posts populares:', error);
    }
    return (<div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-[#111] mb-4 pb-2 border-b border-gray-200">
        Posts Populares
      </h3>
      <div className="space-y-4">
        {posts.length > 0 ? (posts.map((post) => (<PopularPostItem key={`popular-${post.id}`} title={post.title} slug={post.slug} publishedAt={post.publishedAt} readTime={Math.ceil((post.content || '').split(' ').length / 200)}/>))) : (<p className="text-gray-600 text-sm">Nenhum post disponível</p>)}
      </div>
    </div>);
}

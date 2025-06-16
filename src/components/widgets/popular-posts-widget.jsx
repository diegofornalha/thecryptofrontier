'use client';
import React from 'react';
import PopularPostItem from './popular-post-item';
import strapiClient from "@/lib/strapiClient";
import { toStrapiLocale } from '@/lib/locale-utils';
import { useLocale } from '@/contexts/LocaleContext';
import { useEffect, useState } from 'react';
// Client Component
export default function PopularPostsWidget() {
    const { locale } = useLocale();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchPosts() {
            try {
                const strapiLocale = toStrapiLocale(locale);
                const response = await strapiClient.getPosts({
                    pageSize: 5,
                    sort: 'publishedAt:desc',
                    status: 'published',
                    locale: strapiLocale
                });
                if (response.data) {
                    const mappedPosts = response.data.map((post) => {
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
                    setPosts(mappedPosts);
                }
            }
            catch (error) {
                console.error('Erro ao buscar posts populares:', error);
            }
            finally {
                setLoading(false);
            }
        }
        fetchPosts();
    }, [locale]);
    if (loading) {
        return (<div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-[#111] mb-4 pb-2 border-b border-gray-200">
          Posts Populares
        </h3>
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>);
    }
    return (<div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-[#111] mb-4 pb-2 border-b border-gray-200">
        Posts Populares
      </h3>
      <div className="space-y-4">
        {posts.length > 0 ? (posts.map((post) => (<PopularPostItem key={`popular-${post.id}`} title={post.title} slug={post.slug} publishedAt={post.publishedAt || post.createdAt || ''}/>))) : (<p className="text-gray-500 text-sm">Nenhum post encontrado.</p>)}
      </div>
    </div>);
}

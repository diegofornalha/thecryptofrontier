import React from 'react';
import PostTags from '../components/post-tags';
const meta = {
    title: 'Post Components/PostTags',
    component: PostTags,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (<div style={{ padding: '40px' }}>
        <Story />
      </div>),
    ],
    argTypes: {
        tags: {
            control: 'object',
        },
    },
};
export default meta;
export const Default = {
    args: {
        tags: [
            { _id: '1', title: 'Bitcoin', slug: { current: 'bitcoin' } },
            { _id: '2', title: 'Cryptocurrency', slug: { current: 'cryptocurrency' } },
            { _id: '3', title: 'Blockchain', slug: { current: 'blockchain' } },
        ],
    },
};
export const SingleTag = {
    args: {
        tags: [
            { _id: '1', title: 'DeFi', slug: { current: 'defi' } },
        ],
    },
};
export const ManyTags = {
    args: {
        tags: [
            { _id: '1', title: 'Bitcoin', slug: { current: 'bitcoin' } },
            { _id: '2', title: 'Ethereum', slug: { current: 'ethereum' } },
            { _id: '3', title: 'DeFi', slug: { current: 'defi' } },
            { _id: '4', title: 'NFT', slug: { current: 'nft' } },
            { _id: '5', title: 'Web3', slug: { current: 'web3' } },
            { _id: '6', title: 'Metaverse', slug: { current: 'metaverse' } },
            { _id: '7', title: 'Smart Contracts', slug: { current: 'smart-contracts' } },
        ],
    },
};
export const EmptyTags = {
    args: {
        tags: [],
    },
};

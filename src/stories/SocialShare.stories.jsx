import React from 'react';
import SocialShare from '../components/SocialShare';
const meta = {
    title: 'Post Components/SocialShare',
    component: SocialShare,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (<div style={{ padding: '40px' }}>
        <Story />
      </div>),
    ],
    argTypes: {
        url: {
            control: 'text',
        },
        title: {
            control: 'text',
        },
    },
};
export default meta;
export const Default = {
    args: {
        url: 'https://thecryptofrontier.com/post/bitcoin-atinge-nova-maxima',
        title: 'Bitcoin Atinge Nova Máxima Histórica',
    },
};
export const LongTitle = {
    args: {
        url: 'https://thecryptofrontier.com/post/ethereum-merge',
        title: 'Ethereum Completa Transição para Proof of Stake com Sucesso no Evento Histórico Conhecido como The Merge',
    },
};
export const CustomStyling = {
    args: {
        url: 'https://thecryptofrontier.com/post/defi-2024',
        title: 'O Futuro do DeFi em 2024',
    },
    decorators: [
        (Story) => (<div style={{ backgroundColor: '#f3f4f6', padding: '40px', borderRadius: '8px' }}>
        <Story />
      </div>),
    ],
};

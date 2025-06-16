import React from 'react';
import Pagination from '../components/ui/pagination';
const meta = {
    title: 'UI/Pagination',
    component: Pagination,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (<div style={{ padding: '40px' }}>
        <Story />
      </div>),
    ],
    argTypes: {
        currentPage: {
            control: { type: 'number', min: 1 },
        },
        totalPages: {
            control: { type: 'number', min: 1 },
        },
        baseUrl: {
            control: 'text',
        },
    },
};
export default meta;
export const Default = {
    args: {
        currentPage: 5,
        totalPages: 10,
        baseUrl: '/blog',
    },
};
export const FirstPage = {
    args: {
        currentPage: 1,
        totalPages: 10,
        baseUrl: '/blog',
    },
};
export const LastPage = {
    args: {
        currentPage: 10,
        totalPages: 10,
        baseUrl: '/blog',
    },
};
export const FewPages = {
    args: {
        currentPage: 2,
        totalPages: 3,
        baseUrl: '/blog',
    },
};
export const ManyPages = {
    args: {
        currentPage: 15,
        totalPages: 50,
        baseUrl: '/blog',
    },
};

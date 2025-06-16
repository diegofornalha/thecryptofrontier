import React from 'react';
import PopularPostsWidget from '../components/widgets/popular-posts-widget';
const meta = {
    title: 'Widgets/PopularPostsWidget',
    component: PopularPostsWidget,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (<div style={{ width: '300px', backgroundColor: '#f9fafb', padding: '16px' }}>
        <Story />
      </div>),
    ],
};
export default meta;
export const Default = {};
export const InSidebar = {
    decorators: [
        (Story) => (<div style={{ width: '350px', backgroundColor: '#ffffff', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Story />
      </div>),
    ],
};

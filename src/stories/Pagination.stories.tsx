import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import Pagination from '../components/ui/pagination';

const meta: Meta<typeof Pagination> = {
  title: 'UI/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '40px' }}>
        <Story />
      </div>
    ),
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
type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    baseUrl: '/blog',
  },
};

export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    baseUrl: '/blog',
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
    baseUrl: '/blog',
  },
};

export const FewPages: Story = {
  args: {
    currentPage: 2,
    totalPages: 3,
    baseUrl: '/blog',
  },
};

export const ManyPages: Story = {
  args: {
    currentPage: 15,
    totalPages: 50,
    baseUrl: '/blog',
  },
};
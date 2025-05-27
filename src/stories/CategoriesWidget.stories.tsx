import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import CategoriesWidget from '../components/widgets/CategoriesWidget';

const meta: Meta<typeof CategoriesWidget> = {
  title: 'Widgets/CategoriesWidget',
  component: CategoriesWidget,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px', backgroundColor: '#f9fafb', padding: '16px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CategoriesWidget>;

export const Default: Story = {};

export const InSidebar: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: '350px', backgroundColor: '#ffffff', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Story />
      </div>
    ),
  ],
};
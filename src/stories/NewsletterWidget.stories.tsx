import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SimpleNewsletterWidget from '../components/widgets/SimpleNewsletterWidget';

const meta: Meta<typeof SimpleNewsletterWidget> = {
  title: 'Widgets/NewsletterWidget',
  component: SimpleNewsletterWidget,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NewsletterWidget>;

export const Default: Story = {};

export const InSidebar: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: '350px', backgroundColor: '#f9fafb', padding: '24px' }}>
        <Story />
      </div>
    ),
  ],
};
import type { Meta, StoryObj } from '@storybook/react';
import { PostFeedLayoutMigration } from '@/app/design-system/migracao/components/PostFeedLayoutMigration';

const meta = {
  title: 'Migração/PostFeedLayout',
  component: PostFeedLayoutMigration,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PostFeedLayoutMigration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 
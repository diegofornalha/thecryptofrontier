import type { Meta, StoryObj } from '@storybook/react';
import { PostLayoutMigration } from '@/app/design-system/migracao/components/PostLayoutMigration';

const meta = {
  title: 'Migração/PostLayout',
  component: PostLayoutMigration,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PostLayoutMigration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 
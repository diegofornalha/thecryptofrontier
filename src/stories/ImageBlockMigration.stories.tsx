import type { Meta, StoryObj } from '@storybook/react';
import { ImageBlockMigration } from '@/app/design-system/migracao/components/ImageBlockMigration';

const meta = {
  title: 'Migração/ImageBlock',
  component: ImageBlockMigration,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ImageBlockMigration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 
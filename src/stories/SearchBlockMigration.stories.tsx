import type { Meta, StoryObj } from '@storybook/react';
import { SearchBlockMigration } from '@/app/design-system/migracao/components/SearchBlockMigration';

const meta = {
  title: 'Migração/SearchBlock',
  component: SearchBlockMigration,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SearchBlockMigration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 
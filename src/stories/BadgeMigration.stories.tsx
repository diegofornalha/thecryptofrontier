import type { Meta, StoryObj } from '@storybook/react';
import { BadgeMigration } from '@/app/design-system/migracao/components/BadgeMigration';

const meta = {
  title: 'Migração/Badge',
  component: BadgeMigration,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BadgeMigration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 
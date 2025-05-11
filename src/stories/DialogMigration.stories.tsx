import type { Meta, StoryObj } from '@storybook/react';
import { DialogMigration } from '@/app/design-system/migracao/components/DialogMigration';

const meta = {
  title: 'Migração/Dialog',
  component: DialogMigration,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DialogMigration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 
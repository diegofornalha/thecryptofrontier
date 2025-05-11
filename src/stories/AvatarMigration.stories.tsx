import type { Meta, StoryObj } from '@storybook/react';
import { AvatarMigration } from '@/app/design-system/migracao/components/AvatarMigration';

const meta = {
  title: 'Migração/Avatar',
  component: AvatarMigration,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AvatarMigration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 
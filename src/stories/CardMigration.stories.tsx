import type { Meta, StoryObj } from '@storybook/react';
import { CardMigration } from '@/app/design-system/migracao/components/CardMigration';

const meta = {
  title: 'Migração/Card',
  component: CardMigration,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof CardMigration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 
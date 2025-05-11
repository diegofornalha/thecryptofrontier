import type { Meta, StoryObj } from '@storybook/react';
import { LayoutMigration } from '@/app/design-system/migracao/components/LayoutMigration';

const meta = {
  title: 'Migração/Layout',
  component: LayoutMigration,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LayoutMigration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 
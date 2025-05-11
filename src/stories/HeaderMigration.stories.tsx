import type { Meta, StoryObj } from '@storybook/react';
import { HeaderMigration } from '@/app/design-system/migracao/components/HeaderMigration';

const meta = {
  title: 'Migração/Header',
  component: HeaderMigration,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HeaderMigration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 
import type { Meta, StoryObj } from '@storybook/react';
import { FooterMigration } from '@/app/design-system/migracao/components/FooterMigration';

const meta = {
  title: 'Migração/Footer',
  component: FooterMigration,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FooterMigration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 
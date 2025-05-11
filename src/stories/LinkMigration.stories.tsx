import type { Meta, StoryObj } from '@storybook/react';
import { LinkMigration } from '@/app/design-system/migracao/components/LinkMigration';

const meta = {
  title: 'Migração/Link',
  component: LinkMigration,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof LinkMigration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 
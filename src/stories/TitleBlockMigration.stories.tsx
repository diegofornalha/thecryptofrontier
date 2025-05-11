import type { Meta, StoryObj } from '@storybook/react';
import { TitleBlockMigration } from '@/app/design-system/migracao/components/TitleBlockMigration';

const meta = {
  title: 'Migração/TitleBlock',
  component: TitleBlockMigration,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TitleBlockMigration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 
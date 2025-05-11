import type { Meta, StoryObj } from '@storybook/react';
import { FormBlockMigration } from '@/app/design-system/migracao/components/FormBlockMigration';

const meta = {
  title: 'Migração/FormBlock',
  component: FormBlockMigration,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FormBlockMigration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 
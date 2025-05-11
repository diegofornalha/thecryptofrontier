import type { Meta, StoryObj } from '@storybook/react';
import { FormInputMigration } from '@/app/design-system/migracao/components/FormInputMigration';

const meta = {
  title: 'Migração/FormInput',
  component: FormInputMigration,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FormInputMigration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 
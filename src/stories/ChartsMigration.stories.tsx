import type { Meta, StoryObj } from '@storybook/react';
import { ChartsMigration } from '@/app/design-system/migracao/components/ChartsMigration';

const meta = {
  title: 'Migração/Charts',
  component: ChartsMigration,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ChartsMigration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 
import type { Meta, StoryObj } from '@storybook/react';
import { VideoBlockMigration } from '@/app/design-system/migracao/components/VideoBlockMigration';

const meta = {
  title: 'Migração/VideoBlock',
  component: VideoBlockMigration,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof VideoBlockMigration>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
}; 
import type { Meta, StoryObj } from '@storybook/react';
import FeaturedBanner from '../components/sections/home/FeaturedBanner';

const meta: Meta<typeof FeaturedBanner> = {
  title: 'Components/FeaturedBanner',
  component: FeaturedBanner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Componente principal do banner da home. Pode alternar entre conteúdo editorial e publicitário.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showAd: {
      control: 'boolean',
      description: 'Se true, mostra publicidade. Se false, mostra conteúdo editorial',
    },
    adConfig: {
      control: 'object',
      description: 'Configurações do banner publicitário',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: '600px', height: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Banner publicitário (padrão)
export const Advertisement: Story = {
  args: {
    showAd: true,
  },
};

// Banner publicitário customizado
export const CustomAdvertisement: Story = {
  args: {
    showAd: true,
    adConfig: {
      imageUrl: '/ads.jpeg',
      title: 'Aprenda a Investir em Cripto',
      subtitle: 'Curso completo de investimentos em criptomoedas para iniciantes',
      link: 'https://example.com/curso',
    },
  },
};

// Banner editorial (conteúdo do blog)
export const Editorial: Story = {
  args: {
    showAd: false,
  },
};

// Banner publicitário sem texto
export const AdImageOnly: Story = {
  args: {
    showAd: true,
    adConfig: {
      imageUrl: '/ads.jpeg',
      link: 'https://wa.me/5511999999999',
    },
  },
}; 
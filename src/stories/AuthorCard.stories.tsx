import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import AuthorCard from '../components/AuthorCard';

const meta: Meta<typeof AuthorCard> = {
  title: 'Post Components/AuthorCard',
  component: AuthorCard,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px', padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    author: {
      control: 'object',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AuthorCard>;

export const Default: Story = {
  args: {
    author: {
      name: 'João Silva',
      bio: 'Especialista em criptomoedas e blockchain com mais de 5 anos de experiência no mercado. Escreve sobre Bitcoin, Ethereum e as últimas tendências do setor.',
      image: null,
    },
  },
};

export const WithImage: Story = {
  args: {
    author: {
      name: 'Maria Santos',
      bio: 'Analista de mercado cripto e educadora financeira. Ajuda investidores a entender o potencial das moedas digitais.',
      image: {
        _type: 'image',
        asset: {
          _ref: 'image-123',
          _type: 'reference',
        },
      },
    },
  },
};

export const LongBio: Story = {
  args: {
    author: {
      name: 'Pedro Oliveira',
      bio: 'Desenvolvedor blockchain e entusiasta de DeFi. Com background em engenharia de software, Pedro traz uma perspectiva técnica única para suas análises de projetos cripto. Ele acredita firmemente no poder transformador da tecnologia blockchain e trabalha ativamente para tornar o espaço mais acessível para todos. Quando não está escrevendo ou codificando, Pedro gosta de participar de hackathons e contribuir para projetos open source.',
      image: null,
    },
  },
};
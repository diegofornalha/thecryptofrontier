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
      <div style={{ width: '800px', padding: '20px' }}>
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
      _id: '1',
      name: 'Alexandre Bianchi',
      bio: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Trader e investidor profissional, com mais de 10 de experiência no mercado financeiro, especializado em criptomoedas. Ele é o criador de treinamentos como "Trader Crypto Expert", que ensina desde iniciantes até investidores avançados a operar no mercado de criptoativos de forma segura e lucrativa.'
            }
          ]
        }
      ],
      image: null,
      role: 'CEO The Crypto Frontier',
      slug: { current: 'alexandre-bianchi' }
    },
  },
};

export const WithImage: Story = {
  args: {
    author: {
      _id: '2',
      name: 'Alexandre Bianchi',
      bio: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: 'Trader e investidor profissional, com mais de 10 anos de experiência no mercado financeiro, especializado em criptomoedas. Ele é o criador de treinamentos como "Trader Crypto Expert", que ensina desde iniciantes até investidores avançados a operar no mercado de criptoativos de forma segura e lucrativa.'
            }
          ]
        }
      ],
      role: 'CEO The Crypto Frontier',
      slug: { current: 'alexandre-bianchi' },
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
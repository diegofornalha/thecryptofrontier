import type { Meta, StoryObj } from '@storybook/react';
import PageLayout from '@/components/layouts/PageLayout';
import Home from '@/components/sections/home/Home';

const meta = {
  title: 'Layouts/PageLayout',
  component: PageLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Layout padrão do site com NewsHeader no topo e CryptoBasicFooter no rodapé. Usado em todas as páginas para manter consistência.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showBreakingNews: {
      control: 'boolean',
      description: 'Se deve exibir o ticker de últimas notícias (não implementado ainda)',
    },
    className: {
      control: 'text',
      description: 'Classes CSS adicionais para o container',
    },
  },
} satisfies Meta<typeof PageLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComHomepage: Story = {
  args: {},
  render: () => (
    <PageLayout>
      <Home />
    </PageLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Layout padrão com a página inicial do site.',
      },
    },
  },
};

export const ComConteudoSimples: Story = {
  args: {},
  render: () => (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Página de Exemplo</h1>
        <p className="text-gray-600 mb-4">
          Este é um exemplo de como o layout padrão funciona com conteúdo simples.
        </p>
        <p className="text-gray-600">
          O NewsHeader fica no topo, o conteúdo no meio, e o CryptoBasicFooter no rodapé.
        </p>
      </div>
    </PageLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Layout com conteúdo simples para demonstrar a estrutura.',
      },
    },
  },
};

export const ComPaginaBusca: Story = {
  args: {},
  render: () => (
    <PageLayout>
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold mb-4">
              Buscar Artigos
            </h1>
            <p className="text-xl text-indigo-100 max-w-xl mx-auto">
              Encontre os melhores artigos sobre criptomoedas e blockchain
            </p>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-lg rounded-lg -mt-16 p-6 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Sistema de Busca Avançado
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-100 h-48 rounded flex items-center justify-center text-gray-500">
              SearchComponent aqui
            </div>
          </div>
        </div>
      </main>
    </PageLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Layout aplicado à página de busca.',
      },
    },
  },
};

export const ComLayoutTresColunas: Story = {
  args: {},
  render: () => (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Conteúdo principal */}
          <div className="lg:col-span-8">
            <div className="bg-gray-100 h-96 rounded mb-6 flex items-center justify-center text-gray-500">
              Conteúdo Principal
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-100 h-48 rounded flex items-center justify-center text-gray-500">
                Card 1
              </div>
              <div className="bg-gray-100 h-48 rounded flex items-center justify-center text-gray-500">
                Card 2
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="bg-gray-100 h-64 rounded mb-6 flex items-center justify-center text-gray-500">
              Widget 1
            </div>
            <div className="bg-gray-100 h-64 rounded flex items-center justify-center text-gray-500">
              Widget 2
            </div>
          </aside>
        </div>
      </div>
    </PageLayout>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstração do layout de 3 colunas do The Crypto Basic.',
      },
    },
  },
};

export const Mobile: Story = {
  args: {},
  render: () => (
    <PageLayout>
      <div className="px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Conteúdo Mobile</h1>
        <p className="text-gray-600">
          Visualização mobile do layout padrão.
        </p>
      </div>
    </PageLayout>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Layout responsivo em dispositivos móveis.',
      },
    },
  },
};

export const Tablet: Story = {
  args: {},
  render: () => (
    <PageLayout>
      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold mb-4">Conteúdo Tablet</h1>
        <p className="text-gray-600">
          Visualização tablet do layout padrão.
        </p>
      </div>
    </PageLayout>
  ),
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
    docs: {
      description: {
        story: 'Layout responsivo em tablets.',
      },
    },
  },
};
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: [
    '../src/stories/design-system/migracao.mdx',
    '../src/stories/*Migration.stories.@(js|jsx|ts|tsx)'
  ],

  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-mdx-gfm',
    '@chromatic-com/storybook'
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  docs: {},

  viteFinal: async (config) => {
    // Configuração direta do alias sem importar arquivo externo
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@': path.resolve(__dirname, '../src'),
          'next/image': path.resolve(__dirname, './mocks/NextImage.jsx'),
          'next/router': path.resolve(__dirname, './mocks/NextRouter.jsx'),
          'react': path.resolve(__dirname, '../node_modules/react'),
          'react-dom': path.resolve(__dirname, '../node_modules/react-dom'),
          '@radix-ui/react-avatar': path.resolve(__dirname, './mocks/RadixAvatar.jsx'),
          '@/components/ui/avatar': path.resolve(__dirname, './mocks/UIAvatar.jsx'),

        },
      },
      define: {
        'process.env': {},
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.env.__NEXT_IMAGE_OPTS': JSON.stringify({
          deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
          imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
          domains: ['github.com'],
          path: '/',
          loader: 'default',
        }),
        'process.browser': true,
        'process.platform': JSON.stringify('browser'),
      },
      optimizeDeps: {
        esbuildOptions: {
          // Habilita o processamento de JSX em arquivos .js
          loader: {
            '.js': 'jsx',
          },
        },
      },
    };
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript'
  }
};
export default config; 
import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import path from 'path';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  "docs": {
    "autodocs": true
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
          // Alias para componentes do Next.js
          'next/image': path.resolve(__dirname, './mocks/NextImage.tsx'),
          'next/link': path.resolve(__dirname, './mocks/NextLink.tsx'),
        },
      },
      define: {
        // Definindo globais que o Next.js espera
        'process.env': {},
        'process.browser': true,
        'process.version': JSON.stringify(process.version),
      },
      css: {
        postcss: path.resolve(__dirname, './postcss.config.js'),
      },
      build: {
        commonjsOptions: {
          transformMixedEsModules: true,
        },
      },
      optimizeDeps: {
        include: ['@storybook/react'],
      },
    });
  }
};
export default config;
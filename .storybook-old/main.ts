import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import path from 'path';

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  docs: {
    autodocs: "tag"
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
          'next/image': path.resolve(__dirname, './mocks/NextImage.tsx'),
          'next/link': path.resolve(__dirname, './mocks/NextLink.tsx'),
        },
      },
      define: {
        'process.env': {},
      },
    });
  }
};

export default config;
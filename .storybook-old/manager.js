import { addons } from '@storybook/manager-api';

addons.setConfig({
  // Título da sidebar
  sidebar: {
    showRoots: true,
  },
  // Tema do Storybook
  theme: {
    brandTitle: 'The Crypto Frontier - Design System',
    brandUrl: 'https://thecryptofrontier.com',
    brandTarget: '_blank',
    brandImage: 'https://via.placeholder.com/150x50?text=TCF',
    base: 'light',
  },
  // Personalização da UI
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: false },
    copy: { hidden: false },
    fullscreen: { hidden: false },
  },
}); 
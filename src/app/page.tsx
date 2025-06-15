import NewsHeader from '@/components/sections/NewsHeader';
import Home from '@/components/sections/home/home';
import CryptoBasicFooter from '@/components/sections/CryptoBasicFooter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Crypto Frontier - Últimas Notícias sobre Criptomoedas',
  description: 'Fique por dentro das últimas notícias sobre criptomoedas, Bitcoin, Ethereum, análises de mercado e insights do mundo da tecnologia blockchain.',
  keywords: 'criptomoedas, bitcoin, ethereum, blockchain, crypto news, notícias cripto, análise de mercado, DeFi, NFT, Web3',
  authors: [{ name: 'The Crypto Frontier' }],
  openGraph: {
    title: 'The Crypto Frontier - Últimas Notícias sobre Criptomoedas',
    description: 'Fique por dentro das últimas notícias sobre criptomoedas, análises de mercado e insights do mundo da tecnologia blockchain.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'The Crypto Frontier',
    images: [{
      url: '/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'The Crypto Frontier',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Crypto Frontier - Últimas Notícias sobre Criptomoedas',
    description: 'Fique por dentro das últimas notícias sobre criptomoedas e blockchain.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://thecryptofrontier.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function IndexPage() {
  return (
    <>
      <NewsHeader />
      <div className="pt-[70px]">
        <Home />
      </div>
      <CryptoBasicFooter />
    </>
  );
}
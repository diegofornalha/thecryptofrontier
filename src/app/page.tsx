import NewsHeader from '@/components/sections/NewsHeader';
import Home from '@/components/sections/home/Home';
import CryptoBasicFooter from '@/components/sections/CryptoBasicFooter';

export const metadata = {
  title: 'The Crypto Frontier - Últimas Notícias sobre Criptomoedas',
  description: 'Fique por dentro das últimas notícias sobre criptomoedas, análises de mercado e insights do mundo da tecnologia blockchain.',
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
import StrapiConnectionTest from '@/components/StrapiConnectionTest';

export default function TestStrapiPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Teste de Integração Strapi</h1>
        <StrapiConnectionTest />
      </div>
    </div>
  );
}
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function SanityPreview({ preview }) {
  const router = useRouter();

  // Se não estiver em modo preview, não renderiza nada
  if (!preview) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 bg-blue-600 text-white">
      <p className="mr-4">Modo de Preview Ativo</p>
      <Link
        href={`/api/exit-preview?slug=${router.asPath}`}
        className="px-4 py-2 text-sm font-medium text-white bg-blue-800 rounded hover:bg-blue-700"
      >
        Sair do Modo Preview
      </Link>
    </div>
  );
} 